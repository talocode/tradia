export const createChart = jest.fn(() => ({
  addSeries: jest.fn(() => ({
    setData: jest.fn(),
    createPriceLine: jest.fn(() => ({})),
    removePriceLine: jest.fn(),
  })),
  remove: jest.fn(),
  timeScale: jest.fn(() => ({ fitContent: jest.fn() })),
  applyOptions: jest.fn(),
}));

export const CandlestickSeries = {};
export const ColorType = { Solid: 'solid' };