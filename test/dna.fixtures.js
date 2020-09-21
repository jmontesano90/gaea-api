function makeDnaArray() {
  return [
    {
      id: 1,
      user_id: 1,
      name: 'Test 1',
      dna: 'aabbccddeeffkkllmmnnoopp',
      comment: 'Test 1 comment',
    },
    {
      id: 2,
      user_id: 1,
      name: 'Test 1',
      dna: 'aabbccddeeffkkllmmnnoopp',
      comment: 'Test 1 comment',
    },
    {
      id: 3,
      user_id: 2,
      name: 'Test 1',
      dna: 'aabbccddeeffkkllmmnnoopp',
      comment: 'Test 1 comment',
    },
    {
      id: 4,
      user_id: 2,
      name: 'Test 1',
      dna: 'aabbccddeeffkkllmmnnoopp',
      comment: 'Test 1 comment',
    },
  ];
}

function makeMaliciousDna() {
  const maliciousDna = {
    id: 911,
    user_id: 1,
    dna: 'How-to',
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    comment: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  };
  const expectedDna = {
    ...maliciousDna,
    name:
      'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    comment: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  };
  return {
    maliciousDna,
    expectedDna,
  };
}

module.exports = {
  makeDnaArray,
  makeMaliciousDna,
};
