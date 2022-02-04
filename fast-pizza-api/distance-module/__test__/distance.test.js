const sut = require('../distance');

jest.mock('../redis/driversCache');
const getDrivers = require('../redis/driversCache');

getDrivers.mockImplementation(() => 
  [ {
      driverId: "PP0112",
      distance: 3.2939753251542645,
      latitude: -26.27708498510955,
      longitude: 28.009538008901988
    },
    {
      driverId: "TJ0123",
      distance:  5.18,
      latitude: -26.271657203025182, 
      longitude: 28.030163638198243
    }
  ]
);

test('Calculate the distance between two points in km', () => {
  const result = sut.calculateDistance(-26.266848687343796, 27.978537037056565, -26.27708498510955, 28.009538008901988);  
  expect(result).toBe(3.2939753251542645);
});

test('Get nearest driver', async () => {
  
  const userLocation = {
    latitude: -26.266848687343796,
    longitude: 27.978537037056565
  }

  const result = await sut.getNearestDriver(null, userLocation);  
  expect(result).toStrictEqual({
    driverId: "PP0112",
    distance: 3.2939753251542645,
    latitude: -26.27708498510955,
    longitude: 28.009538008901988
  });

});