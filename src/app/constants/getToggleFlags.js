const toggleFlagStorage = require('./data/toggleFlagsStorage');

const getFilteredToggleFlags = async (req, res) => {
    const listOfFilteredFlags = await toggleFlagStorage.listOfFilteredFlags(req.params.type,req.params.service_name);
    if (!listOfFilteredFlags) {
      res.status(404).send();
      return;
    }
    res.status(200).send(extractToggleFlagObjects(listOfFilteredFlags));
  };


  const getToggleFlags = async (req, res) => {
    const toggleFlags = await toggleFlagStorage.listOfFlags();
    if (!toggleFlags) {
      res.status(404).send();
      return;
    }
    res.status(200).send(extractToggleFlagObjects(toggleFlags));
  };
  
  const extractToggleFlagObjects = (toggleFlags) => {
    return toggleFlags.map((toggleFlag) => {
        return { type: toggleFlag.type, serviceName: toggleFlag.serviceName,flag: toggleFlag.flag}
    });
  }

  module.exports = {
      getFilteredToggleFlags,
      getToggleFlags
  }
  