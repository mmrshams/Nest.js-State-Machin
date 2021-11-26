export function name(message: any) {
  const {title, artist} = message.payload.payload;
  return {
    body: `${title} ${artist}`,
    username: 'test_username',
    songId: 31231,
  };
}

export function kafka(message: any) {
  const {payload} = message;
  return [
    {
      value: JSON.stringify(payload),
      headers: {
        header1: 'h1',
      },
    },
  ];
}
