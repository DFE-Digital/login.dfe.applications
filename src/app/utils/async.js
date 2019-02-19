const forEachAsync = async (col, iteratee) => {
  for (let i = 0; i < col.length; i += 1) {
    await iteratee(col[i], i);
  }
};

module.exports = {
  forEachAsync,
};
