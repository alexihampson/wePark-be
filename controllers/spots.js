const { fetchSpotBySpotId } = require("../models/spots");

exports.getSpotBySpotId = (req, res, next) => {
    const { spot_id } = req.params; 
    fetchSpotBySpotId(spot_id).then((spot) => {
        res.status(200).send(spot); 
    })
    .catch((err) => {
        console.log(err);
        next(err)
    })
}