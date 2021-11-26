import {Injectable} from '@nestjs/common';
import {get} from 'lodash';
import {
  NormalizerPluginInputInterface,
  NormalizerPluginResultInterface,
  ZIIF,
} from 'src/core/interfaces/normalizer.interface';
import {NormalizerPluginInterface} from 'src/plugins/interfaces/normalizer-plugin.interface';

@Injectable()
export class ZIIFNormalizer implements NormalizerPluginInterface {
  async normalize(
    normalizerInput: NormalizerPluginInputInterface
  ): Promise<NormalizerPluginResultInterface> {
    const {message, normalizer} = normalizerInput;
    const errors: Array<Error> = [];
    try {
      const normalized = this.transform(
        (message as unknown) as Record<string, unknown>,
        normalizer,
        errors
      );
      return {data: this.removeEmpty(normalized), errors};
    } catch (error) {
      return {data: {}, errors};
    }
  }

  private transform(
    message: Record<string, unknown>,
    ziifs: Array<ZIIF>,
    errors: Array<Error>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const ziif of ziifs) {
      let field = get(message, ziif.key);
      const key = ziif.as;
      if (Array.isArray(field)) {
        if (!result[key]) result[key] = [];
        if (ziif.innerNormalizers) {
          if (Object.keys(field).length) {
            const subField = field.map(item => {
              return this.transform(item, ziif.innerNormalizers || [], errors);
            });
            (result[key] as Array<unknown>).push(...subField);
          }
        } else {
          if (ziif.prioritizeCast && ziif.castTo) {
            field = (field as Array<unknown>).map(item =>
              this.cast(item, ziif.castTo!)
            );
          }
          if (ziif.validation) {
            if (ziif.validation.type) {
              field = (field as Array<unknown>)
                .map(item => {
                  if (
                    ziif.validation!.type &&
                    typeof item !== ziif.validation!.type
                  ) {
                    errors.push(
                      new Error(
                        `${item} did not match typeof ${ziif.validation!.type}`
                      )
                    );
                    return;
                  }
                  return item;
                })
                .filter(item => item !== undefined);
            }
            if (ziif.validation.schema) {
              //
            }
          }
          if (!ziif.prioritizeCast && ziif.castTo) {
            field = (field as Array<unknown>).map(item =>
              this.cast(item, ziif.castTo!)
            );
          }
          (result[key] as Array<unknown>).push(...(field as Array<unknown>));
        }
      } else if (field instanceof Object && ziif.innerNormalizers) {
        result[key] = this.transform(
          field as Record<string, unknown>,
          ziif.innerNormalizers || [],
          errors
        );
      } else {
        if (ziif.prioritizeCast && ziif.castTo) {
          field = this.cast(field, ziif.castTo);
        }
        if (ziif.validation) {
          if (ziif.validation.type && typeof field !== ziif.validation.type) {
            errors.push(
              new Error(
                `${field} did not match typeof ${ziif.validation!.type}`
              )
            );
            continue;
          }
          if (ziif.validation.schema) {
            //
          }
        }
        if (!ziif.prioritizeCast && ziif.castTo) {
          field = this.cast(field, ziif.castTo);
        }
        if (ziif.asArray) {
          result[key] = [field];
        } else {
          result[key] = field;
        }
      }
    }
    return result;
  }

  removeEmpty = (obj: Record<string, unknown>) => {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object')
        this.removeEmpty(obj[key] as Record<string, unknown>);
      else if (obj[key] === undefined) delete obj[key];
    });
    return obj;
  };

  cast(value: unknown, castType: string): unknown {
    switch (castType) {
      case 'number':
        return Number(value);
      case 'boolean':
        return !(
          (typeof value === 'string' &&
            (value === 'false' ||
              value === '0' ||
              value === 'undefined' ||
              value === 'null' ||
              value === 'NaN')) ||
          (typeof value === 'number' && (value === 0 || isNaN(value))) ||
          value === false ||
          value === undefined ||
          value === null
        );
      default:
        return String(value);
    }
  }
}
