module.exports = function(console) {
	this.error = function(err) {
		console.log(err.toString());
	};
};