import { NativeModules } from 'react-native';

const UpiModule = NativeModules.UpiPay;

const RNUpiPayment = {
  requiredFields: [
    'vpa',
    'amount',
    'payeeName',
    'transactionRef'
  ],

  upiConfig: {
    vpa: 'pa',
    payeeName: 'pn',
    transactionRef: 'tr',
    amount: 'am',
    transactionNote: 'tn',
    currency: 'cu'
  },

  UPI_APP_NOT_INSTALLED: 'UPI supporting app not installed',
  REQUEST_CODE_MISMATCH: 'Request Code Mismatch',
  NO_ACTION_TAKEN: 'No action taken',

  validateObject(config: Object) {
    const errorArray = [];
    this.requiredFields.forEach((eachField) => {
      if (!config[eachField]) {
        errorArray.push(eachField);
      }
    });

    return errorArray;
  },

  successCallback(success: Function) {
    return (data) => {
      data = JSON.parse(data);
      console.log(data)
      const successString = data.nameValuePairs && data.nameValuePairs.message;
      let successObj = this.convertStringToObject(successString);
      success(successObj);
    };
  },

  failureCallback(failure: Function) {
    return (data) => {
      data = JSON.parse(data);

      let failureObj = {};
      const failureString = data.nameValuePairs && data.nameValuePairs.message;


      if (failureString === this.UPI_APP_NOT_INSTALLED ||
        failureString === this.REQUEST_CODE_MISMATCH ||
        failureString === this.NO_ACTION_TAKEN
      ) {
        failure(data.nameValuePairs);
      } else {
        failureObj = this.convertStringToObject(failureString);
        failure(failureObj);
      }

    };
  },

  convertStringToObject(responseString: string) {
    console.log(responseString)
    let object = {};
    const stringArray = responseString.split('&');
    object = stringArray.reduce((accumulator, current) => {
      const currentArray = current.split('=');
      accumulator[currentArray[0]] = currentArray[1];
      return accumulator;
    }, {});

    return object;
  },

  isAppInstalled(appName) {
    let PACKAGE_NAME = "";

    if (appName == 'GOOGLE_PAY') {
      PACKAGE_NAME = "com.google.android.apps.nbu.paisa.user";
    } else if (appName == 'PHONEPE') {
      PACKAGE_NAME = "com.phonepe.app";
    } else if (appName == 'PAYTM') {
      PACKAGE_NAME = "net.one97.paytm";
    } else if (appName == 'BHIM') {
      PACKAGE_NAME = "in.org.npci.upiapp";
    } else if (appName == 'JIO') {
      PACKAGE_NAME = "com.jio.myjio";
    }

    return UpiModule.isAppInstalled(PACKAGE_NAME)
  },

  initializePayment(config, paymentMode, success, failure) {
    let paymentApp = {};
    
    if (paymentMode == 'GOOGLE_PAY') {
      paymentApp.PACKAGE_NAME = "com.google.android.apps.nbu.paisa.user";
      paymentApp.REQUEST_CODE = 123;
    } else if (paymentMode == 'PHONEPE') {
      paymentApp.PACKAGE_NAME = "com.phonepe.app";
      paymentApp.REQUEST_CODE = 123;
    } else if (paymentMode == 'PAYTM') {
      paymentApp.PACKAGE_NAME = "net.one97.paytm";
      paymentApp.REQUEST_CODE = 123;
    } else if (paymentMode == 'BHIM') {
      paymentApp.PACKAGE_NAME = "in.org.npci.upiapp";
      paymentApp.REQUEST_CODE = 123;
    } else if (paymentMode == 'JIO') {
      paymentApp.PACKAGE_NAME = "com.jio.myjio";
      paymentApp.REQUEST_CODE = 123;
    }

    if (typeof success !== 'function') {
      throw new Error('Success callback not a function');
    }

    if (typeof failure !== 'function') {
      throw new Error('Failure callback not a function');
    }

    if (typeof config !== 'object') {
      throw new Error('config not of type object');
    }

    const errorArray = this.validateObject(config);

    if (errorArray.length > 0) {
      throw new Error(`Following keys are required ${JSON.stringify(errorArray)}`);
    }

    config.currency = 'INR';
    let upiString = 'upi://pay?';

    let queryString = Object.keys(config).reduce((accumulator, current) => {
      let prefix = '';
      if (accumulator) {
        prefix = '&';
      }
      accumulator = accumulator + prefix +
        `${this.upiConfig[current]}=${encodeURIComponent(config[current])}`;

      return accumulator;
    }, '');
    const upiConfig = {}
    upiConfig.upiString = `upi://pay?${queryString}`;
    UpiModule.intializePayment(upiConfig, paymentApp, this.successCallback(success), this.failureCallback(failure));
  }
}

module.exports = RNUpiPayment;
