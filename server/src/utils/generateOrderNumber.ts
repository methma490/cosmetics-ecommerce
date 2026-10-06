const generateOrderNumber = (): string => {
  const timestamp = Date.now();

  const randomNumber =
    Math.floor(
      1000 + Math.random() * 9000
    );

  return `ORD-${timestamp}-${randomNumber}`;
};

export default generateOrderNumber;