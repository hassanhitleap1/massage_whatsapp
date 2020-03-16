const storageInstance = getStorageInstance();
const analyticsInstance = getAnalyticsInstance();
chrome.runtime.onInstalled.addListener(async function (details) {
	if (details.reason == "install") {
		const refid = await getRefCookie();
		await storageInstance.saveRefID(refid);
		if (refid !== "RMG303") {
			await analyticsInstance.logInstalls(refid)
		}
		await storageInstance.setInstallTimeStamp()
	}
	await showWhatsappTab();
	var notifOptions = {
		type: "basic",
		iconUrl: "img/icon128.png",
		title: "Hi Whats Installation Finished.",
		message: "Click on the Icon above"
	};
	chrome.notifications.create(notifOptions, function (notificationID) {
		console.log(notificationID, "notif created", chrome.runtime.lastError)
	})
});
chrome.runtime.onMessage.addListener(async function (msg, sender) {
	if (msg.subject === MSG_GET_REF_COOKIE) {
		const refid = await getRefCookie();
		sendMsgToExtension({
			from: "backgorund,js",
			subject: MSG_REF_COOKIE_VALUE,
			data: refid
		})
	}
	if (msg.subject === MSG_SHOW_WHATSAPP_TAB) {
		showWhatsappTab(false)
	}
	return true;
});
async function showWhatsappTab(reload = true) {
	chrome.tabs.getAllInWindow(null, function (tabs) {
		console.log(tabs);
		const whatsappTab = tabs.find(tab => tab.url === "https://web.whatsapp.com" || tab.url === "https://web.whatsapp.com/");
		console.log(whatsappTab);
		if (whatsappTab) {
			chrome.tabs.update(whatsappTab.id, {
				active: true
			}, function (tab) {
				console.log("Error")
			});
			if (reload) {
				setTimeout(function () {
					chrome.tabs.reload(whatsappTab.id)
				}, 500)
			}
		} else {
			const newURL = "https://web.whatsapp.com";
			chrome.tabs.create({
				url: newURL
			})
		}
	})
}
async function getRefCookie() {
	return new Promise(resolve => {
		chrome.cookies.getAll({
			domain: ".hiwhats.info"
		}, function (cookies) {
			let refid = "";
			for (var i = 0; i < cookies.length; i++) {
				console.log(cookies[i]);
				if (cookies[i].name === "refid") {
					refid = cookies[i].value
				}
			}
			resolve(refid)
		})
	})
}

///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////getAnalyticsInstance////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
function getAnalyticsInstance() {
	//const ROOT_URL = " https://us-central1-wasender-in.cloudfunctions.net";
	const ROOT_URL = "https://www.hiwhats.info/API";
	const LOGIN_URL = `${ROOT_URL}/Login/`;
	const INSTALL_URL = `${ROOT_URL}/logInstalls/`;
	const REVISIT_URL = `${ROOT_URL}/logRevists/`;
	const SINGLE_MSG_URL = `${ROOT_URL}/logSingleMsgs/`;
	const BULK_MSG_URL = `${ROOT_URL}/logBulkMsgs/`;
	const LOGIN_FAILED_URL = `${ROOT_URL}/logLoginFailed/`;
	const LOGIN_SIGNUP_URL = `${ROOT_URL}/Signup/`;
	
	async function logInstalls(refid) {
		await fetch(`${INSTALL_URL}?refid=${refid}`)
	}
	async function logRevisits(userid) {
		await fetch(`${REVISIT_URL}?userid=${userid}`)
	}
	async function logSingleMsgs(userid) {
		await fetch(`${SINGLE_MSG_URL}?userid=${userid}`)
	}
	async function logBulkMsgs(mobile,password,from,to,msg,sentstate) {
		await fetch(`${BULK_MSG_URL}?mobile=${mobile}&password=${password}&from=${from}&to=${to}&msg=${msg}&sentstate=${sentstate}&json=1`);
	}
	async function logLogin( phonenumber, password, refid) {
		await fetch(`${LOGIN_URL}?mobile=${encodeURI(phonenumber)}&password=${encodeURI(password)}&refid=${encodeURI(refid)}`)
	}
	async function logLoginFailed(phonenumber) {
		await fetch(`${LOGIN_FAILED_URL}?mobile=${encodeURI(phonenumber)}`)
	}
	async function getLoginUrl() {
		return (LOGIN_URL);
	}
	async function getSignUpUrl() {
		return (LOGIN_SIGNUP_URL);
	}
	return {
		logInstalls: logInstalls,
		logRevisits: logRevisits,
		logSingleMsgs: logSingleMsgs,
		logBulkMsgs: logBulkMsgs,
		logLogin: logLogin,
		logLoginFailed: logLoginFailed,
		getLoginUrl: getLoginUrl,
		getSignUpUrl: getSignUpUrl
	}
}
///////////////////////////////////////////////////
///////////////////////////////////////////////////
///////////////getAnalyticsInstance////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////





///////////////////////////////////////////////////
///////////////////////////////////////////////////
////////////////  StorageInstance   ///////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
const KEY_AUTHID = "KEY_AUTHID";
const KEY_ACTIVE_TAB = "KEY_ACTIVE_TAB";
const KEY_INSTALL_TIMESTAMP = "KEY_INSTALL_TIMESTAMP";
const KEY_PHONE_NUMBER = "KEY_PHONE_NUMBER";
const KEY_CURRENT_MSG = "KEY_CURRENT_MSG";
const KEY_PHONE_NUMBERS_BULK = "KEY_PHONE_NUMBERS_BULK";
const KEY_CURRENT_MSG_BULK = "KEY_CURRENT_MSG_BULK";
const KEY_ALL_CONTACTS = "KEY_ALL_CONTACTS";
const KEY_AUTH_PHONENUMBER = "KEY_AUTH_PHONENUMBER";
const KEY_AUTH_PASSWORD = "KEY_AUTH_PASSWORD";
const KEY_IS_AUTHORIZED = "KEY_IS_AUTHORIZED";
const KEY_REF_ID = "KEY_REF_ID";
const KEY_AUTH_NAME = "KEY_AUTH_NAME";
const KEY_AUTH_KIND = "KEY_AUTH_KIND";
const KEY_AUTH_EXP_DATE = "KEY_AUTH_EXP_DATE";
const KEY_AUTH_DELAY_TIME = "KEY_AUTH_DELAY_TIME";

function getStorageInstance() {
	function setStorage(key, value) {
		return new Promise((resolve, reject) => {
			const obj = {};
			obj[key] = value;
			chrome.storage.local.set(obj, function () {
				resolve()
			})
		})
	}

	function getStorage(key) {
		return new Promise((resolve, reject) => {
			chrome.storage.local.get(key, function (result) {
				resolve(result[key])
			})
		})
	}

	function delStorage(key) {
		return new Promise((resolve, reject) => {
			chrome.storage.local.remove(key, function () {
				console.log(key + ': Removed');
			})
		})
	}

	function savePhoneNumber(phoneNumber) {
		return setStorage(KEY_PHONE_NUMBER, phoneNumber)
	}
	async function getPhoneNumber() {
		const strPhoneNumber = await getStorage(KEY_PHONE_NUMBER);
		return strPhoneNumber
	}

	function saveCurrentMessage(currentMessage) {
		return setStorage(KEY_CURRENT_MSG, currentMessage)
	}

	function getCurrentMessage() {
		return getStorage(KEY_CURRENT_MSG)
	}

	function savePhoneNumbersBulk(phoneNumbers) {
		return setStorage(KEY_PHONE_NUMBERS_BULK, JSON.stringify(phoneNumbers))
	}
	async function getPhoneNumbersBulk() {
		const strPhoneNumbers = await getStorage(KEY_PHONE_NUMBERS_BULK);
		if (strPhoneNumbers) {
			return JSON.parse(strPhoneNumbers)
		} else return []
	}

	function saveCurrentMessageBulk(currentMessage) {
		return setStorage(KEY_CURRENT_MSG_BULK, currentMessage)
	}

	function getCurrentMessageBulk() {
		return getStorage(KEY_CURRENT_MSG_BULK)
	}

	function saveActiveTab(activeTab) {
		return setStorage(KEY_ACTIVE_TAB, activeTab)
	}

	function getActiveTab() {
		return getStorage(KEY_ACTIVE_TAB)
	}

	function setInstallTimeStamp() {
		return setStorage(KEY_INSTALL_TIMESTAMP, `${Date.now()}`)
	}

	function getInstallTimeStamp() {
		return getStorage(KEY_INSTALL_TIMESTAMP)
	}

	function saveAllContacts(allContacts) {
		return setStorage(KEY_ALL_CONTACTS, JSON.stringify(allContacts))
	}
	async function getAllContacts() {
		const strAllContatcs = await getStorage(KEY_ALL_CONTACTS);
		if (strAllContatcs) {
			return JSON.parse(strAllContatcs)
		} else return []
	}

	function getAuthId() {
		return getStorage(KEY_AUTHID);
	}

	function saveAuthId(authid) {
		return setStorage(KEY_AUTHID, authid);
	}

	async function getAuthPhoneNumber() {
		return getStorage(KEY_AUTH_PHONENUMBER);
	}

	function saveAuthPhoneNumber(phoneNumber) {
		return setStorage(KEY_AUTH_PHONENUMBER, phoneNumber);
	}

	async function getAuthPassword() {
		return getStorage(KEY_AUTH_PASSWORD);
	}

	function saveAuthPassword(name) {
		return setStorage(KEY_AUTH_PASSWORD, name);
	}

	function getRefID() {
		return getStorage(KEY_REF_ID);
	}

	function saveRefID(refID) {
		return setStorage(KEY_REF_ID, refID);
	}

	function getAuthName() {
		return getStorage(KEY_AUTH_NAME);
	}

	function saveAuthName(AuthName) {
		return setStorage(KEY_AUTH_NAME, AuthName);
	}

	function getAuthKind() {
		return getStorage(KEY_AUTH_KIND);
	}

	function saveAuthKind(AuthKind) {
		return setStorage(KEY_AUTH_KIND, AuthKind);
	}

	function getAuthExpDate() {
		return getStorage(KEY_AUTH_EXP_DATE);
	}

	function saveAuthExpDate(AuthExpDate) {
		return setStorage(KEY_AUTH_EXP_DATE, AuthExpDate);
	}

	async function getAuthDelayTime() {
		console.log(`GETTING DelayTime` + getStorage(KEY_AUTH_DELAY_TIME));
		return getStorage(KEY_AUTH_DELAY_TIME);
	}

	function saveAuthDelayTime(AuthDelayTime) {
		console.log(`saved DelayTime` + AuthDelayTime);
		return setStorage(KEY_AUTH_DELAY_TIME, AuthDelayTime);
	}

	function delAllKeys() {
		delStorage(KEY_AUTHID);
		delStorage(KEY_ACTIVE_TAB);
		delStorage(KEY_INSTALL_TIMESTAMP);
		delStorage(KEY_PHONE_NUMBER);
		delStorage(KEY_CURRENT_MSG);
		delStorage(KEY_PHONE_NUMBERS_BULK);
		delStorage(KEY_CURRENT_MSG_BULK);
		delStorage(KEY_ALL_CONTACTS);
		//delStorage(KEY_AUTH_PHONENUMBER);
		//delStorage(KEY_AUTH_PASSWORD);
		delStorage(KEY_IS_AUTHORIZED);
		delStorage(KEY_REF_ID);
		delStorage(KEY_AUTH_NAME);
		delStorage(KEY_AUTH_KIND);
		delStorage(KEY_AUTH_EXP_DATE);
	}
	return {
		saveCurrentMessage: saveCurrentMessage,
		savePhoneNumber: savePhoneNumber,
		getCurrentMessage: getCurrentMessage,
		getPhoneNumber: getPhoneNumber,
		saveCurrentMessageBulk: saveCurrentMessageBulk,
		savePhoneNumbersBulk: savePhoneNumbersBulk,
		getCurrentMessageBulk: getCurrentMessageBulk,
		getPhoneNumbersBulk: getPhoneNumbersBulk,
		getActiveTab: getActiveTab,
		saveActiveTab: saveActiveTab,
		getAllContacts: getAllContacts,
		saveAllContacts: saveAllContacts,
		getInstallTimeStamp: getInstallTimeStamp,
		setInstallTimeStamp: setInstallTimeStamp,
		getAuthId: getAuthId,
		saveAuthId: saveAuthId,
		getAuthPassword: getAuthPassword,
		saveAuthPassword: saveAuthPassword,
		getAuthPhoneNumber: getAuthPhoneNumber,
		saveAuthPhoneNumber: saveAuthPhoneNumber,
		getRefID: getRefID,
		saveRefID: saveRefID,
		getAuthName: getAuthName,
		saveAuthName: saveAuthName,
		getAuthKind: getAuthKind,
		saveAuthKind: saveAuthKind,
		getAuthExpDate: getAuthExpDate,
		saveAuthExpDate: saveAuthExpDate,
		getAuthDelayTime: getAuthDelayTime,
		saveAuthDelayTime: saveAuthDelayTime,
		delAllKeys: delAllKeys
	}
}
///////////////////////////////////////////////////
///////////////////////////////////////////////////
////////////////  StorageInstance   ///////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////





///////////////////////////////////////////////////
///////////////////////////////////////////////////
//////////////////  SEND SCRIPT   /////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
const MSG_SEND_MESSAGE = "MSG_SEND_MESSAGE";
const MSG_GET_CONTACTS = "MSG_GET_CONTACTS";
const MSG_SEARCH_CONTACTS = "MSG_SEARCH_CONTACTS";
const MSG_UPDATE_CONTACTS = "MSG_UPDATE_CONTACTS";
const MSG_GET_REF_COOKIE = "MSG_GET_REF_COOKIE";
const MSG_REF_COOKIE_VALUE = "MSG_REF_COOKIE_VALUE";
const MSG_GET_USER_PHONENUMBER = "MSG_GET_USER_PHONENUMBER";
const MSG_SHOW_WHATSAPP_TAB = "MSG_SHOW_WHATSAPP_TAB";
const MSG_GET_PAGE_URL = "MSG_GET_PAGE_URL";
const MSG_SEND_MEDIA_MESSAGE = "MSG_SEND_MEDIA_MESSAGE";

function getActiveTab() {
	return new Promise(resolve => {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			resolve(tabs[0].id)
		})
	})
}

function sendMsgToActiveTab(msg) {
	return new Promise(resolve => {
		getActiveTab().then(tabid => {
			chrome.tabs.sendMessage(tabid, msg, data => {
				resolve(data)
			})
		})
	})
}

function sendMsgToExtension(msg) {
	chrome.runtime.sendMessage(msg)
}

function setPopUp(html) {
	chrome.runtime.sendMessage({
		from: "content",
		subject: "load-popup",
		html: html
	})
}
///////////////////////////////////////////////////
///////////////////////////////////////////////////
//////////////////  SEND SCRIPT   /////////////////
///////////////////////////////////////////////////
///////////////////////////////////////////////////
