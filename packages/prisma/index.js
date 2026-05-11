if (!Object.prototype.hasOwnProperty.call(BigInt.prototype, 'toJSON')) {
  Object.defineProperty(BigInt.prototype, 'toJSON', {
    value() {
      return this.toString();
    },
  });
}

export * from '@prisma/client';
