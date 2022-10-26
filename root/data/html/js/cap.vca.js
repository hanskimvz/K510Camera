/*	This file uses JsDoc Toolkit documentation.
 *	http://code.google.com/p/jsdoc-toolkit/
 */

/**	@fileOverview This file contains the CAP VCA Javascript Library.
 *	@author CAP
 */

/*jslint
	devel:		true,
	browser:	true,
	es5:		true,
	vars:		true,
	maxerr:		50,
	indent:		4,
 */

/*global
	CAP,
	$,
 */

(function (window, undefined) {
	'use strict';
	// Local copies of the window objects for speed
	var document	= window.document;
	var navigator	= window.navigator;
	var location	= window.location;
	var CAP			= window.CAP;
	var $			= window.$;

	// Check the CAP namespace has been included
	if ((CAP === undefined) ||
			(window === undefined) ||
			($ === undefined)) {
		console.error('CAP.VCA: Error: You must include the base CAP library and jQuery');
		CAP.VCA	= undefined;
		return;
	}

	// If CAP.VCA has already been added don't add it again!
	if (window.CAP.VCA) {
		return;
	}

	// If the top level window has CAP in it use that
	if (window.top.CAP) {
		if (window.top.CAP.VCA) {
			window.CAP.VCA = window.top.CAP.VCA;
			return;
		}
	}

	/**	A local private copy of our VCA namespace.
	 *	@exports VCA as CAP.VCA
	 *	@private
	 *	@since Version 0.1.0
	 */
	var VCA = {};

	/**	Definitions that can be used throughout the library.
	 *	<br/><br/>
	 *	They are <code>Object.freeze</code>'ed in the
	 *	<code>VCA.methods.init()</code> function to prevent
	 *	values being changed.
	 *	<br/><br/>
	 *	These are like <code>#define</code> in C programming.
	 *	@namespace	Private Definitions
	 *	@private
	 *	@since Version 0.1.0
	 */
	VCA.defines = {};

	/**	Enumerators that can be used throughout the library.
	 *	<br/><br/>
	 *	They are <code>Object.freeze</code>'ed in the
	 *	<code>VCA.methods.init()</code> function to prevent
	 *	values being changed.
	 *	<br/><br/>
	 *	These are like <code>enums</code> in C programming.
	 *	@namespace	Private enumerators
	 *	@private
	 *	@since Version 0.1.0
	 */
	VCA.enums = {};

	/**	Private members
	 *	@namespace	Private members
	 *	@private
	 *	@since Version 0.1.0
	 */
	VCA.members =
		{
			/**	If the VCA library is initialized
			 *	@private
			 *	@since Version 0.1.4
			 */
			initialized: false
		};

	/**	Private event handlers
	 *	@namespace	Private event handlers
	 *	@private
	 *	@since Version 0.1.0
	 */
	VCA.eventCallback = {};

	/**	Private Methods
	 *	@namespace	Private Methods
	 *	@private
	 *	@since Version 0.1.0
	 */
	VCA.methods =
		{
			/**	This initialises our namespace, doing various
			 *	things so that the VCA library can be used effectively
			 *	in the user agent.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.0
			 */
			init: function () {
				try {
					CAP.logging.verbose('Initialising CAP.VCA Namespace...');

					if (!CAP.ajax.serverDataLoaded()) {
						$(window.top).bind('capServerDataLoaded', VCA.methods.init);
						CAP.logging.info('Server data not loaded.  CAP.VCA initialization is waiting for \'capServerDataLoaded\' event');
						return;
					}

					if ('function' === typeof (Object.freeze)) {
						Object.freeze(VCA.defines);
						Object.freeze(VCA.enums);
					}

					// Create the license objects
					var numOfLicense = 10;
					CAP.logging.debug('Creating ' + numOfLicense + ' license classes');
					var license	= 0;
					for (license = 0; license < numOfLicense; license += 1) {
						CAP.VCA.license.push(new VCA.classes.license(license));
					}

					// Create the channel objects
					var numOfChannels = CAP.ajax.getServerData('VIDEOIN.nbrofchannel');
					CAP.logging.debug('Creating ' + numOfChannels + ' channel classes');
					var channel	= 0;
					for (channel = 0; channel < numOfChannels; channel += 1) {
						CAP.VCA.channel.push(new VCA.classes.channel(channel));
					}
				} catch (exception) {
					CAP.logging.error('CAP.VCA Namespace Initialisation...FAILED: ' + exception);
					return;
				}

				VCA.members.initialized = true;
				$(window.top).trigger('capVcaInitialized');
				CAP.logging.info('CAP.VCA Namespace Initialisation...DONE!');
			},

			/**	The hardware GUID.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.6
			 */
			hwGuid: function (value) {
				if (value === undefined) {
					try {
						var hwguidString = CAP.ajax.getServerData('VCA.hwguid');
						if ('string' !== typeof (hwguidString)) {
							throw CAP.exception.FAIL;
						}
						return hwguidString;
					} catch (exception) {
						CAP.logging.error('Failed to get hardware GUID');
						throw exception;
					}
				} else {
					throw CAP.exception.INVALID_PARAMS;
				}
			},

			/**	The number of VCA licenses.
			 *	@throws		{CAP.exception}	A CAP exception
			 *	@private
			 *	@since Version 0.1.6
			 */
			numberOfLicenses: function (value) {
				if (value === undefined) {
					try {
						var licString = CAP.ajax.getServerData('VCA.nbroflicense');
						if ('string' !== typeof (licString)) {
							throw CAP.exception.FAIL;
						}
						return parseInt(licString, 10);
					} catch (exception) {
						CAP.logging.error('Failed to get number of VCA licenses');
						throw exception;
					}
				} else {
					throw CAP.exception.INVALID_PARAMS;
				}
			}
		};

	/**	VCA classes that can be used.
	 *	@namespace	Private Classes
	 *	@private
	 *	@since Version 0.1.0
	 */
	VCA.classes =
		{
			/**	The license class
			 *	@class Represents a VCA license
			 *	@param licenseNo	{number}	The license number for this class instance
			 *	@public
			 *	@exports CAP.VCA.classes.license as CAP.VCA.license
			 *	@since Version 0.1.6
			 */
			license: function (licenseNo) {
				if ('number' !== typeof (licenseNo)) {
					throw CAP.exception.INVALID_PARAMS;
				}

				/**	Checks if this is a valid license
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name valid
				 *	@since Version 0.1.6
				 */
				this.valid	= function () {
					return (null !== CAP.ajax.getServerData('VCA.Lc' + licenseNo, true));
				};

				/**	The information of the license
				 *	@example	var info = CAP.VCA.license[0].info();
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name info
				 *	@since Version 0.1.0
				 */
				this.info	= function (value) {
					if (value === undefined) {
						try {
							if (!CAP.VCA.license[licenseNo].valid()) {
								throw new Error('Invalid License');
							}
							var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.licenseinfo', true);
							if ('string' !== typeof (str)) {
								throw CAP.exception.FAIL;
							}
							return str;
						} catch (exception) {
							CAP.logging.error('Failed to get info for license ' + licenseNo + ': ' + exception);
							throw exception;
						}
					} else {
						throw CAP.exception.INVALID_PARAMS;
					}
				};

				/**	The product of the license
				 *	@example	var info = CAP.VCA.license[0].product();
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name product
				 *	@since Version 0.1.0
				 */
				this.product	= function (value) {
					if (value === undefined) {
						try {
							if (!CAP.VCA.license[licenseNo].valid()) {
								throw new Error('Invalid License');
							}
							var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.product');
							if ('string' !== typeof (str)) {
								throw CAP.exception.FAIL;
							}
							return str;
						} catch (exception) {
							CAP.logging.error('Failed to get product for license ' + licenseNo + ': ' + exception);
							throw exception;
						}
					} else {
						throw CAP.exception.INVALID_PARAMS;
					}
				};

				/**	The product code of the license
				 *	@example	var info = CAP.VCA.license[0].productCode();
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name productCode
				 *	@since Version 0.1.0
				 */
				this.productCode	= function (value) {
					if (value === undefined) {
						try {
							if (!CAP.VCA.license[licenseNo].valid()) {
								throw new Error('Invalid License');
							}
							var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.productcode');
							if ('string' !== typeof (str)) {
								throw CAP.exception.FAIL;
							}
							return str;
						} catch (exception) {
							CAP.logging.error('Failed to get product code for license ' + licenseNo + ': ' + exception);
							throw exception;
						}
					} else {
						throw CAP.exception.INVALID_PARAMS;
					}
				};

				/**	The expired state of the license
				 *	@example	var info = CAP.VCA.license[0].expired();
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name expired
				 *	@since Version 0.1.0
				 */
				this.expired		= function (value) {
					if (value === undefined) {
						try {
							if (!CAP.VCA.license[licenseNo].valid()) {
								throw new Error('Invalid License');
							}
							var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.expired');
							if ('string' !== typeof (str)) {
								throw CAP.exception.FAIL;
							}
							return ('yes' === str.toLowerCase());
						} catch (exception) {
							CAP.logging.error('Failed to get expired state for license ' + licenseNo + ': ' + exception);
							throw exception;
						}
					} else {
						throw CAP.exception.INVALID_PARAMS;
					}
				};


				/**	The id of the license
				 *	@example	var info = CAP.VCA.license[0].id();
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name id
				 *	@since Version 0.1.8
				 */
				this.id	= function (value) {
					if (value === undefined) {
						try {
							if (!CAP.VCA.license[licenseNo].valid()) {
								throw new Error('Invalid License');
							}
							var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.id');
							if ('string' !== typeof (str)) {
								throw CAP.exception.FAIL;
							}
							return parseInt(str, 10);
						} catch (exception) {
							CAP.logging.error('Failed to get id for license ' + licenseNo + ': ' + exception);
							throw exception;
						}
					} else {
						throw CAP.exception.INVALID_PARAMS;
					}
				};

				/**	The features of this license
				 *	@example	var info = CAP.VCA.license[0].features.calibration();
				 *	@fieldOf CAP.VCA.license
				 *	@public
				 *	@name features
				 *	@since Version 0.1.8
				 */
				this.features	= {
					/**	The number of channels this license supports feature
					 *	@example	var info = CAP.VCA.license[0].features.numberOfChannels();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name numberOfChannels
					 *	@since Version 0.1.8
					 */
					numberOfChannels: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.nbrofchannel');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return parseInt(str, 10);
							} catch (exception) {
								CAP.logging.error('Failed to get number of channels for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The calibration feature
					 *	@example	var info = CAP.VCA.license[0].features.calibration();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name calibration
					 *	@since Version 0.1.8
					 */
					calibration: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.calibration');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get calibration feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The counting feature
					 *	@example	var info = CAP.VCA.license[0].features.counting();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name counting
					 *	@since Version 0.1.8
					 */
					counting: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.counting');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get counting feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The statistics feature
					 *	@example	var info = CAP.VCA.license[0].features.statistics();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name statistics
					 *	@since Version 0.1.8
					 */
					statistics: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.statistics');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get counting feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The metadata feature
					 *	@example	var info = CAP.VCA.license[0].features.metadata();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name metadata
					 *	@since Version 0.1.8
					 */
					metadata: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.metadata');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get metadata feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The presence feature
					 *	@example	var info = CAP.VCA.license[0].features.presence();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name presence
					 *	@since Version 0.1.8
					 */
					presence: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.presence');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get presence feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The enter feature
					 *	@example	var info = CAP.VCA.license[0].features.enter();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name enter
					 *	@since Version 0.1.8
					 */
					enter: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.enter');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get enter feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The exit feature
					 *	@example	var info = CAP.VCA.license[0].features.exit();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name exit
					 *	@since Version 0.1.8
					 */
					exit: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.exit');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get exit feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The appear feature
					 *	@example	var info = CAP.VCA.license[0].features.appear();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name appear
					 *	@since Version 0.1.8
					 */
					appear: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.appear');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get appear feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The disappear feature
					 *	@example	var info = CAP.VCA.license[0].features.disappear();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name disappear
					 *	@since Version 0.1.8
					 */
					disappear: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.disappear');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get disappear feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The stopped feature
					 *	@example	var info = CAP.VCA.license[0].features.stopped();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name stopped
					 *	@since Version 0.1.8
					 */
					stopped: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.stopped');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get stopped feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The dwell feature
					 *	@example	var info = CAP.VCA.license[0].features.dwell();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name dwell
					 *	@since Version 0.1.8
					 */
					dwell: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.dwell');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get dwell feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The direction feature
					 *	@example	var info = CAP.VCA.license[0].features.direction();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name direction
					 *	@since Version 0.1.8
					 */
					direction: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.direction');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get direction feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The speed feature
					 *	@example	var info = CAP.VCA.license[0].features.speed();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name speed
					 *	@since Version 0.1.8
					 */
					speed: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.speed');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get speed feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The linecounter feature
					 *	@example	var info = CAP.VCA.license[0].features.linecounter();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name linecounter
					 *	@since Version 0.1.8
					 */
					linecounter: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.linecounter');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get linecounter feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The retailtracking feature
					 *	@example	var info = CAP.VCA.license[0].features.retailtracking();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name linecounter
					 *	@since Version 0.1.8
					 */
					retailtracking: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.peopletracking');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get retailtracking feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The trackingengine feature
					 *	@example	var info = CAP.VCA.license[0].features.trackingengine();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name trackingengine
					 *	@since Version 0.1.8
					 */
					trackingengine: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.trackingengine');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get trackingengine feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The autotracking layon feature
					 */
					autotrackinglayon: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.autotrackinglayon');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get autotrackinglayon feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The complexrules feature
					 *	@example	var info = CAP.VCA.license[0].features.complexrules();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name complexrules
					 *	@since Version 0.1.8
					 */
					complexrules: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.complexrules');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get complexrules feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The tamper feature
					 *	@example	var info = CAP.VCA.license[0].features.tamper();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name tamper
					 *	@since Version ? (May 2017)
					 */
					tamper: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.tamper');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return ('yes' === str.toLowerCase());
							} catch (exception) {
								CAP.logging.error('Failed to get tamper feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The maximum number of zones feature
					 *	@example	var info = CAP.VCA.license[0].features.maxNumberOfZones();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name maxNumberOfZones
					 *	@since Version 0.1.8
					 */
					maxNumberOfZones: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.maxnbrofzone');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return parseInt(str, 10);
							} catch (exception) {
								CAP.logging.error('Failed to get maximum number of zones feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The maximum number of rules feature
					 *	@example	var info = CAP.VCA.license[0].features.maxNumberOfRules();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name maxNumberOfRules
					 *	@since Version 0.1.8
					 */
					maxNumberOfRules: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.maxnbrofrule');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return parseInt(str, 10);
							} catch (exception) {
								CAP.logging.error('Failed to get maximum number of rules feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					},

					/**	The maximum number of counters feature
					 *	@example	var info = CAP.VCA.license[0].features.maxNumberOfCounters();
					 *	@fieldOf CAP.VCA.license.features
					 *	@public
					 *	@name maxNumberOfCounters
					 *	@since Version 0.1.8
					 */
					maxNumberOfCounters: function (value) {
						if (value === undefined) {
							try {
								if (!CAP.VCA.license[licenseNo].valid()) {
									throw new Error('Invalid License');
								}
								var str = CAP.ajax.getServerData('VCA.Lc' + licenseNo + '.Sf.maxnbrobcounter');
								if ('string' !== typeof (str)) {
									throw CAP.exception.FAIL;
								}
								return parseInt(str, 10);
							} catch (exception) {
								CAP.logging.error('Failed to get maximum number of counters feature for license ' + licenseNo + ': ' + exception);
								throw exception;
							}
						} else {
							throw CAP.exception.INVALID_PARAMS;
						}
					}
				};
			},

			/**	The channel class
			 *	@class Represents a VCA channel
			 *	@param channelNo	{number}	The channel number for this class instance
			 *	@public
			 *	@exports CAP.VCA.classes.channel as CAP.VCA.channel
			 *	@since Version 0.1.0
			 */
			channel: function (channelNo) {
				if ('number' !== typeof (channelNo)) {
					throw CAP.exception.INVALID_PARAMS;
				}

				/**	The enabled state of the channel
				 *	@example	CAP.VCA.channel[0].enable(true);
				 *	@example	var enabled = CAP.VCA.channel[0].enable();
				 *	@fieldOf CAP.VCA.channel
				 *	@public
				 *	@name enable
				 *	@since Version 0.1.0
				 */
				this.enable	= function (value) {
					if (value === undefined) {
						try {
							var enableString = CAP.ajax.getServerData('VCA.Ch' + channelNo + '.enable');
							if ('string' !== typeof (enableString)) {
								throw CAP.exception.FAIL;
							}
							return ('yes' === enableString.toLowerCase());
						} catch (exception) {
							CAP.logging.error('Failed to get enabled status for channel ' + channelNo + ': ' + exception);
							throw exception;
						}
					} else {
						try {
							if ('boolean' !== typeof (value)) {
								throw CAP.exception.INVALID_PARAMS;
							}
							CAP.ajax.setServerData(
								[
									{
										action: 'update',
										group: 'VCA.Ch' + channelNo,
										entries:
											[
												{
													id:		'enable',
													value:	value ? 'yes' : 'no'
												}
											]
									}
								]
							);
						} catch (e) {
							CAP.logging.error('Failed to set enabled status for channel ' + channelNo + ': ' + e);
							throw e;
						}
					}
				};

				/**	The counting line enabled state of the channel
				 *	@example	CAP.VCA.channel[0].enableCountingLine(true);
				 *	@example	var enabled = CAP.VCA.channel[0].enableCountingLine();
				 *	@public
				 *	@fieldOf CAP.VCA.channel
				 *	@name enableCountingLine
				 *	@since Version 0.1.0
				 */
				this.enableCountingLine	= function (value) {
					if (value === undefined) {
						try {
							var enableString = CAP.ajax.getServerData('VCA.Ch' + channelNo + '.enablecntline');
							if ('string' !== typeof (enableString)) {
								throw CAP.exception.FAIL;
							}
							return ('yes' === enableString.toLowerCase());
						} catch (exception) {
							CAP.logging.error('Failed to get counting line enabled status for channel ' + channelNo + ': ' + exception);
							throw exception;
						}
					} else {
						try {
							if ('boolean' !== typeof (value)) {
								throw CAP.exception.INVALID_PARAMS;
							}
							CAP.ajax.setServerData(
								[
									{
										action: 'update',
										group: 'VCA.Ch' + channelNo,
										entries:
											[
												{
													id:		'enablecntline',
													value:	value ? 'yes' : 'no'
												}
											]
									}
								]
							);
						} catch (e) {
							CAP.logging.error('Failed to set enabled counting line status for channel ' + channelNo + ': ' + e);
							throw e;
						}
					}
				};

				/**	The object tracking enabled state of the channel
				 *	@example	CAP.VCA.channel[0].enableObjectTracking(true);
				 *	@example	var enabled = CAP.VCA.channel[0].enableObjectTracking();
				 *	@public
				 *	@fieldOf CAP.VCA.channel
				 *	@name enableObjectTracking
				 *	@since Version 0.1.0
				 */
				this.enableObjectTracking	= function (value) {
					if (value === undefined) {
						try {
							var enableString = CAP.ajax.getServerData('VCA.Ch' + channelNo + '.enablemovobj');
							if ('string' !== typeof (enableString)) {
								throw CAP.exception.FAIL;
							}
							return ('yes' === enableString.toLowerCase());
						} catch (exception) {
							CAP.logging.error('Failed to get object tracking enabled status for channel ' + channelNo + ': ' + exception);
							throw exception;
						}
					} else {
						try {
							if ('boolean' !== typeof (value)) {
								throw CAP.exception.INVALID_PARAMS;
							}
							CAP.ajax.setServerData(
								[
									{
										action: 'update',
										group: 'VCA.Ch' + channelNo,
										entries:
											[
												{
													id:		'enablemovobj',
													value:	value ? 'yes' : 'no'
												}
											]
									}
								]
							);
						} catch (e) {
							CAP.logging.error('Failed to set enabled object tracking status for channel ' + channelNo + ': ' + e);
							throw e;
						}
					}
				};

				/**	The camera cancellation enabled state of the channel
				 *	@example	CAP.VCA.channel[0].enableCameraShakeCancel(true);
				 *	@example	var enabled = CAP.VCA.channel[0].enableCameraShakeCancel();
				 *	@public
				 *	@fieldOf CAP.VCA.channel
				 *	@name enableCameraShakeCancel
				 *	@since Version 0.1.0
				 */
				this.enableCameraShakeCancel	= function (value) {
					if (value === undefined) {
						try {
							var enableString = CAP.ajax.getServerData('VCA.Ch' + channelNo + '.St.enable');
							if ('string' !== typeof (enableString)) {
								throw CAP.exception.FAIL;
							}
							return ('yes' === enableString.toLowerCase());
						} catch (exception) {
							CAP.logging.error('Failed to get camera shake cancellation status for channel ' + channelNo + ': ' + exception);
							throw exception;
						}
					} else {
						try {
							if ('boolean' !== typeof (value)) {
								throw CAP.exception.INVALID_PARAMS;
							}
							CAP.ajax.setServerData(
								[
									{
										action: 'update',
										group: 'VCA.Ch' + channelNo + 'St',
										entries:
											[
												{
													id:		'enable',
													value:	value ? 'yes' : 'no'
												}
											]
									}
								]
							);
						} catch (e) {
							CAP.logging.error('Failed to set camera shake cancellation status for channel ' + channelNo + ': ' + e);
							throw e;
						}
					}
				};

				/**	Returns an array of license numbers assigned to this channel
				 *	@example	var enabled = CAP.VCA.channel[0].licenses();
				 *	@public
				 *	@fieldOf CAP.VCA.channel
				 *	@name licenses
				 *	@since Version 0.1.7
				 */
				this.licenses	= function (value) {
					if (value === undefined) {
						try {
							var channelLicenses = CAP.ajax.getServerData('VCA.Ch' + channelNo + '.licenseid').split(','),
								i;
							channelLicenses	= channelLicenses || [];
							for (i = 0; i < channelLicenses.length; i += 1) {
								channelLicenses[i] = parseInt(channelLicenses[i], 10);
								if (isNaN(channelLicenses[i])) {
									channelLicenses = [];
									break;
								}
							}
							return channelLicenses;
						} catch (exception) {
							CAP.logging.error('Failed to get licenses for channel ' + channelNo + ': ' + exception);
							throw exception;
						}
					} else {
						throw CAP.exception.INVALID_PARAMS;
					}
				};

				/**	Information about the licenses applied to this channel
				 *	@example	var enabled = CAP.VCA.channel[0].license.features.linecounter();
				 *	@public
				 *	@fieldOf CAP.VCA.channel
				 *	@name license
				 *	@since Version 0.1.8
				 */
				this.license	= {
					/**	License features this channels has
					 *	@example	var enabled = CAP.VCA.channel[0].license.features.linecounter();
					 *	@public
					 *	@fieldOf CAP.VCA.channel.license
					 *	@name features
					 *	@since Version 0.1.8
					 */
					features: {
						/**	Channel has a license for calibration
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.calibration();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.calibration
						 *	@name features
						 *	@since Version 0.1.8
						 */
						calibration: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.calibration();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get calibration feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for counting
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.counting();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.counting
						 *	@name features
						 *	@since Version 0.1.8
						 */
						counting: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.counting();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get counting feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for line counting
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.linecounter();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.license
						 *	@name features
						 *	@since Version 0.1.8
						 */
						linecounter: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.linecounter();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get line counter feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for tracking engine
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.trackingengine();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.license
						 *	@name features
						 *	@since Version 0.1.8
						 */
						trackingengine: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.trackingengine();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get tracking engine feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for autotracking layon
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.autotrackinglayon();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.license
						 *	@name features
						 */
						autotrackinglayon: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.autotrackinglayon();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get retail tracking feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for retail tracking
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.retailtracking();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.license
						 *	@name features
						 */
						retailtracking: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.retailtracking();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get retail tracking feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for complex rules
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.complexrules();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.license
						 *	@name features
						 *	@since Version 0.1.8
						 */
						complexrules: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.complexrules();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get complex rules feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},

						/**	Channel has a license for tamper detection
						 *	@example	var enabled = CAP.VCA.channel[0].license.features.tamper();
						 *	@public
						 *	@fieldOf CAP.VCA.channel.license
						 *	@name features
						 *	@since Version ? (May 2017)
						 */
						tamper: function (value) {
							if (value === undefined) {
								try {
									var licenses = CAP.VCA.channel[channelNo].licenses(),
										i = 0,
										ret = false;
									for (i = 0; i < licenses.length; i += 1) {
										ret = ret || CAP.VCA.license[licenses[i]].features.tamper();
										if (ret) { break; }
									}
									return ret;
								} catch (exception) {
									CAP.logging.error('Failed to get tamper feature for channel ' + channelNo + ': ' + exception);
									throw exception;
								}
							} else {
								throw CAP.exception.INVALID_PARAMS;
							}
						},
					}
				};
			}
		};

	/**	The VCA namespace is for controlling the VCA content of the 
	 *	CAP software.
	 *	@namespace		The VCA namespace is for controlling the VCA content of the 
	 *					CAP software.
	 *	@version 0.1.8
	 */
	CAP.VCA = {
		/**	If VCA has been initialized yet.
		 *	@throws		{CAP.exception}	A CAP exception
		 *	@private
		 *	@since Version 0.1.4
		 */
		initialized: function () {
			return VCA.members.initialized;
		},

		/**	Gets the hardware GUID.
		 *	@throws		{CAP.exception}	A CAP exception
		 *	@private
		 *	@since Version 0.1.6
		 */
		hwGuid: function () {
			return VCA.methods.hwGuid();
		},

		/**	Gets the number of licenses.
		 *	@throws		{CAP.exception}	A CAP exception
		 *	@private
		 *	@since Version 0.1.6
		 */
		numberOfLicenses: function () {
			return VCA.methods.numberOfLicenses();
		},

		// Documentation for the licenses in in VCA.classes.license
		license: [],

		// Documentation for the channels in in VCA.classes.channel
		channel: []
	};

	// Initialise the namespace when the DOM loads
	$(document).ready(VCA.methods.init);
}(window));
