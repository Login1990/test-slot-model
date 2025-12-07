const PAYLINES = [
  // 1: middle horizontal
  [
    [0,0,0,0,0],
    [1,1,1,1,1],
    [0,0,0,0,0]
  ],

  // 2: top horizontal
  [
    [1,1,1,1,1],
    [0,0,0,0,0],
    [0,0,0,0,0]
  ],

  // 3: bottom horizontal
  [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,1,1,1]
  ],

  // 4: V shape (top -> middle -> bottom -> middle -> top)
  [
    [1,0,0,0,1],
    [0,1,0,1,0],
    [0,0,1,0,0]
  ],

  // 5: inverted V (bottom -> middle -> top -> middle -> bottom)
  [
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,0,0,1]
  ],

  // 6: diagonal down-right then stay bottom
  [
    [1,0,0,0,0],
    [0,1,0,0,0],
    [0,0,1,1,1]
  ],

  // 7: diagonal up-right then stay top
  [
    [0,0,1,1,1],
    [0,1,0,0,0],
    [1,0,0,0,0]
  ],

  // 8: zigzag starting top (top, mid, top, mid, top)
  [
    [1,0,1,0,1],
    [0,1,0,1,0],
    [0,0,0,0,0]
  ],

  // 9: zigzag starting bottom (bottom, mid, bottom, mid, bottom)
  [
    [0,0,0,0,0],
    [0,1,0,1,0],
    [1,0,1,0,1]
  ],

  // 10: descending staircase then stay bottom
  [
    [1,1,0,0,0],
    [0,0,1,0,0],
    [0,0,0,1,1]
  ]
];

module.exports = {PAYLINES};