const toRowData = ({
  text, pos, type, category, meaning,
}) => ([
  text,
  pos ? JSON.stringify(pos) : null,
  type ? JSON.stringify(type) : null,
  category ? JSON.stringify(category) : null,
  meaning ? JSON.stringify(meaning) : null,
]);

const toWordObject = ({
  text, pos, type, category, meaning,
}) => ({
  text,
  pos: JSON.parse(pos),
  type: JSON.parse(type),
  category: JSON.parse(category),
  meaning: JSON.parse(meaning),
});

exports.toRowData = toRowData;
exports.toWordObject = toWordObject;
