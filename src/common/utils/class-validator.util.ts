import * as joi from 'joiful';

export function validate<T>(
  object: unknown,
  classType: {new (object: Partial<T>): T},
  options: {
    convert: boolean;
    noDefaults: boolean;
    stripUnknown: boolean;
  } = {convert: false, noDefaults: true, stripUnknown: true}
): Array<T> | T {
  if (object instanceof Array) {
    return validateArray<T>(object as Array<T>, classType, options);
  }
  return validateWithClass<T>(
    object as Record<string, unknown>,
    classType,
    options
  );
}

export function validateWithClass<T>(
  object: Record<string, unknown>,
  classType: {new (object: Partial<T>): T},
  options: {
    convert: boolean;
    noDefaults: boolean;
    stripUnknown: boolean;
  }
): T {
  const objInstance = new classType(object as Partial<T>);

  const {error, value} = joi.validateAsClass(objInstance, classType, {
    allowUnknown: true,
    skipFunctions: true,
    stripUnknown: options.stripUnknown,
    convert: options.convert,
    noDefaults: options.noDefaults,
  });

  if (error) {
    throw new Error(error.message);
  }
  return value;
}

export function validateArray<T>(
  objects: Array<T>,
  classType: {new (object: Partial<T>): T},
  options: {
    convert: boolean;
    noDefaults: boolean;
    stripUnknown: boolean;
  }
): Array<T> {
  const objInstance: Array<T> = objects.map(
    obj => new classType(obj as Partial<T>)
  );

  const {error, value} = joi.validateArrayAsClass(objInstance, classType, {
    allowUnknown: true,
    skipFunctions: true,
    stripUnknown: options.stripUnknown,
    convert: options.convert,
    noDefaults: options.noDefaults,
  });

  if (error) {
    throw new Error(error.message);
  }
  return value;
}
