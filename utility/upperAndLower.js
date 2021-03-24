const getUpper = (snowflake) => {
	return snowflake.substring(0, snowflake.length / 2);
};

const getLower = (snowflake) => {
	return snowflake.substring(snowflake.length / 2);
};

module.exports = {
	getUpper,
	getLower,
};