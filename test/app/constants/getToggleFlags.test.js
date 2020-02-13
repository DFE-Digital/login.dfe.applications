jest.mock('./../../../src/app/constants/data/toggleFlagsStorage', () => {
    return {
        listOfFilteredFlags: jest.fn().mockReturnValue([{ 
            type:'email', serviceName:'services', flag:true
        }]),
        listOfFlags: jest.fn().mockReturnValue([{ 
            type:'email', serviceName:'services', flag:true
        },
        { 
            type:'email', serviceName:'support', flag:false
        }])
    }
});

jest.mock('./../../../src/infrastructure/logger', () => require('./../../utils').mockLogger());

const {mockRequest, mockResponse} = require('./../../utils');
const {listOfFilteredFlags, listOfFlags} = require('./../../../src/app/constants/data/toggleFlagsStorage');
const {getFilteredToggleFlags,getToggleFlags } = require('./../../../src/app/constants/getToggleFlags');

const res = mockResponse();

describe('when getting toggle flags by type and service name', () => {
    let req;

    beforeEach(() => {
        req = mockRequest({
        params: {
            type: 'email',
            serviceName: 'services'
        }
        });
        res.mockResetAll();
    });

    it('then it should find flag as true', async () => {
        await getFilteredToggleFlags(req, res);
        expect(listOfFilteredFlags).toHaveBeenCalledTimes(1);
        expect(listOfFilteredFlags.mock.results[0].value[0].flag).toEqual(true);
    });

});

describe('when getting toggle flags', () => {
    let req;

    beforeEach(() => {
        req = mockRequest();
        res.mockResetAll();
    });

    it('then it should find two flags as true', async () => {
        await getToggleFlags(req, res);
        expect(listOfFlags).toHaveBeenCalledTimes(1);
        expect(listOfFlags.mock.results[0].value[0].flag).toEqual(true);
        expect(listOfFlags.mock.results[0].value[1].flag).toEqual(false);
    });

});
  