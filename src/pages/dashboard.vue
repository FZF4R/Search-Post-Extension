<script setup lang="ts">
import AnalyticsAward from '@/views/dashboard/AnalyticsAward.vue';
import AnalyticsBarCharts from '@/views/dashboard/AnalyticsBarCharts.vue';
import AnalyticsDepositWithdraw from '@/views/dashboard/AnalyticsDepositWithdraw.vue';
import AnalyticsSalesByCountries from '@/views/dashboard/AnalyticsSalesByCountries.vue';
import AnalyticsTotalEarning from '@/views/dashboard/AnalyticsTotalEarning.vue';
import AnalyticsTotalProfitLineCharts from '@/views/dashboard/AnalyticsTotalProfitLineCharts.vue';
import AnalyticsTransactions from '@/views/dashboard/AnalyticsTransactions.vue';
import AnalyticsUserTable from '@/views/dashboard/AnalyticsUserTable.vue';
import AnalyticsWeeklyOverview from '@/views/dashboard/AnalyticsWeeklyOverview.vue';
import CardStatisticsVertical from '@core/components/cards/CardStatisticsVertical.vue';
import triangleDark from '@images/misc/triangle-dark.png'
import triangleLight from '@images/misc/triangle-light.png'
import trophy from '@images/misc/pricing-tree-3.png'
import { useTheme } from 'vuetify'
import { ref } from 'vue';
import Dcom from './Services/dcom.js';
// import {runCommand}  from './Services/dcom.js';

import { 
  GetRequestFtechScript, 
  GetFB_DtsgValue, 
  GetRequestFtechUnFriendScript,   
  GetEAABToken,
  GetUrlTokenEAABByDocument,
  GetTokenEAABByDOM,
  GetEAABTokenURL,
  GetResponseByUrl,
  GetAllFriendByToken,
  SendQueryRequestFtech,
  GetScriptByModel } from './Services/LoginService.ts';
import { saveAs } from 'file-saver';

interface DataItem {
    id: string
    description: string
    status: number
    name: string
    birth_day: string
}


const userList: DataItem[] = ref([])
const scanPosts: string[] = ref([]);
const isRecentPost = ref(false);
const isSimplePost = ref(true);

const changeCheckboxOption = function(){
  isSimplePost.value = !isRecentPost.value;
}

const changeCheckboxOptionDcom = function(){
  isRecentPost.value = !isSimplePost.value;
}

const status: Record < DataItem['status'], string > = {
    1: 'Friend',
    2: 'Friend_Pending'
}

const statusColor: Record < typeof status[number], string > = {
    Friend: 'success',
    Friend_Pending: 'primary'
}

const headers = [
  'UID',
  'Tên tài khoản',
  'Trạng thái',
  'Mô tả',
  'Hành động'
]

const runCount = ref(0)
const runUids = [];
var ACCOUNT_UID = "";
var ACCOUNT_FB_DTSG = "";

interface Statistic {
    id: number;
    stats: number;
    title: string;
    icon: string;
    color: string;
}

const statistics: Statistic[] = [
  {
    id: 1,
    title: 'Đã gửi yêu cầu',
    stats: 0,
    icon: 'mdi-account-check-outline',
    color: 'success',
  },
]

const { global } = useTheme()
const triangleBg = computed(() => global.name.value === 'light' ? triangleLight : triangleDark)
const isDcom = ref(true);
const uids = ref("");
const accountCookie = ref("");
const searchResults = ref("");
const objProxies = ref([]);

var getLabelDelays = function() {
    return `Delay ${threadCountReset.value} luồng (s)`;
};

const fileContent = ref("");
const fileInput = ref();
const fileName = ref("");
const threadCountReset = ref(10); // Reset Dcom sau mỗi 1800 Request
const delaySingleThread = ref(200)
const delayThreads = ref(3)
const actionRunning = ref(false);
const blockedAllProxy = ref(false);
const eaabToken = "";
const copyAccountClipboard = function(rowItem) {
  if (navigator.clipboard) {
      const textToCopy = `${rowItem.id}|${rowItem.name.replace('\r', '')}|${rowItem.birth_day}`;
      navigator.clipboard.writeText(textToCopy)
          .then(() => {})
          .catch(err => {});
  } else {
      console.error('Trình duyệt không hỗ trợ Clipboard API.');
  }
}
const runLoginWithCookie = function() {
  var e = accountCookie.value;
  for (var t = e.split(";"), o = 0; o < t.length; o++)
  try {
    var r = t[o].split("=")[0].trim();
    var n = t[o].split("=")[1].trim();
    
    chrome.cookies.set({
      url: "https://www.facebook.com",
      name: r,
      value: n,
      domain: ".facebook.com",
    }),
      chrome.cookies.set({
        url: "https://upload.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      }),
      chrome.cookies.set({
        url: "https://business.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      }),
      chrome.cookies.set({
        url: "https://web.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      }),
      chrome.cookies.set({
        url: "https://m.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      }),
      chrome.cookies.set({
        url: "https://mbasic.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      }),
      chrome.cookies.set({
        url: "https://developers.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      }),
      chrome.cookies.set({
        url: "https://mobile.facebook.com",
        name: r,
        value: n,
        domain: ".facebook.com",
      });
  } catch (e) {
    console.log(e);
  }

  setTimeout(() => {
    chrome.cookies.getAll({ domain: '.facebook.com' }, cookies => {
      let uidCookie = cookies.find(cookie => cookie.name == "c_user");
      if (uidCookie && uidCookie.value) {
        alert("Đăng nhập thành công...")
      } else {
        alert("Có lỗi xảy ra...")
      }
    })
  }, 500);
}

const runAddFriendAction = function() {
  var accounts = uids.value.split('\n').filter(x => x && x.trim().length);
  if (!accounts || accounts.length == 0) {
      alert("Chưa nhập UIDs");
      return;
  }

  actionRunning.value = true;
  chrome.cookies.getAll({ domain: '.facebook.com' }, cookies => {
    let uidCookie = cookies.find(cookie => cookie.name == "c_user");
    if (uidCookie && uidCookie.value) {
      ACCOUNT_UID = uidCookie.value;
      console.log("UID ==> " + uidCookie.value);
      if (ACCOUNT_FB_DTSG.length) {
        RunAddFriendByConfig(uidCookie.value, accounts, ACCOUNT_FB_DTSG);
      } else {
        GetFB_DtsgValue().then((dtsgval: string)=> {
          ACCOUNT_FB_DTSG = dtsgval;
          if (dtsgval.length > 0)  {
            RunAddFriendByConfig(uidCookie.value, accounts, dtsgval);
          } else {
            alert("Có lỗi xảy ra. Vui lòng thử lại")
          }
        });
      }
    } else {
      alert("Chưa đăng nhập Facebook...")
    }

  });
}

const CopyCookie = function(){
  chrome.cookies.getAll({ domain: '.facebook.com' }, cookies => {
    let uidCookie = cookies.find(cookie => cookie.name == "c_user");
    if (uidCookie && uidCookie.value) {
      ACCOUNT_UID = uidCookie.value;
      let strCookies = [];
      cookies.forEach(fbcookie => {
        strCookies.push(`${fbcookie.name}=${fbcookie.value};`)
      });
      if (navigator.clipboard) {
        const textToCopy = strCookies.join(' ');
        navigator.clipboard.writeText(textToCopy)
          .then(() => {})
          .catch(err => {});
      } else {
          console.error('Trình duyệt không hỗ trợ Clipboard API.');
      }
    } else {
      alert("Chưa đăng nhập Facebook...")
    }
  });
}


const RunAddFriendByConfig = async function(uid: string,accounts: string[], fb_dtsg: string) {
    let index = 0;
    runCount.value = 0;
    let actionAccounts = []
    for (index = 0; index < accounts.length; index++) {
        actionAccounts.push(accounts[index]);
        if (actionAccounts.length == threadCountReset.value) {
            if (!actionRunning.value) return;
            var tempActionAccounts = JSON.parse(JSON.stringify(actionAccounts));
            await RunActionThreadByAccounts(uid, tempActionAccounts, fb_dtsg);
            actionAccounts = [];
            await wait(delayThreads.value * 1000);
        }

        if (index + 1 == accounts.length  ) {
            RunActionThreadByAccounts(uid, actionAccounts,fb_dtsg, true).then((res) => {
                alert("Hoàn thành...")
            }).catch((err) => {
                console.log(err);
            });

            actionRunning.value = false;
            return;
        }
    }
}

const RunActionThreadByAccounts = async function(uid: string, accounts: string[], fb_dtsg: string, isForceRun: bool = false) {
    return Promise.all(
        accounts.map(async (account, index) => {
            if (!isForceRun && !actionRunning.value) return;
            await wait(index * delaySingleThread.value);
            try {
                if (!isForceRun && !actionRunning.value) return;
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                  var activeTab = tabs[0];
                  var script = GetRequestFtechScript(uid, account, fb_dtsg);
                  //// TODO: Uncomment khi build
                  var response = chrome.tabs.executeScript(activeTab.id, { code: script });
                  SetActionStateValue(response, account);
                });
            } catch (error) {
                console.log(error.message);
            }
        })
    )
}

const runUnFriendAction = function() {
  var accounts = uids.value.split('\n').filter(x => x && x.trim().length);
  if (!accounts || accounts.length == 0) {
    alert("Chưa nhập UIDs");
    return;
  }
  runCount.value = 0;

  actionRunning.value = true;
  chrome.cookies.getAll({ domain: '.facebook.com' }, cookies => {
    let uidCookie = cookies.find(cookie => cookie.name == "c_user");
    if (uidCookie && uidCookie.value) {
      ACCOUNT_UID = uidCookie.value;
      if (ACCOUNT_FB_DTSG.length > 0) {
        RunUnFriendByConfig(uidCookie.value, accounts, ACCOUNT_FB_DTSG);
      } else {
        GetFB_DtsgValue().then((dtsgval: string)=> {
          ACCOUNT_FB_DTSG = dtsgval;
          if (dtsgval.length > 0)  {
            RunUnFriendByConfig(uidCookie.value, accounts, dtsgval);
          } else {
            alert("Có lỗi xảy ra. Vui lòng thử lại")
          }
        });
      }
    } else {
      alert("Chưa đăng nhập Facebook...")
    }

  });
}

const RunUnFriendByConfig = async function(uid: string,accounts: string[], fb_dtsg: string) {
    let index = 0;
    let actionAccounts = []
    for (index = 0; index < accounts.length; index++) {
        actionAccounts.push(accounts[index]);
        if (actionAccounts.length == threadCountReset.value) {
            if (!actionRunning.value) return;
            var tempActionAccounts = JSON.parse(JSON.stringify(actionAccounts));
            await RunUnFriendActionThreadByAccounts(uid, tempActionAccounts, fb_dtsg);
            actionAccounts = [];
            await wait(delayThreads.value * 1000);
        }

        if (index + 1 == accounts.length ) {
          RunUnFriendActionThreadByAccounts(uid, actionAccounts, fb_dtsg, true).then((res) => {
                alert("Hoàn thành...")
            }).catch((err) => {
                console.log(err);
            });

            actionRunning.value = false;
            return;
        }
    }
}

const RunUnFriendActionThreadByAccounts = async function(uid: string, accounts: string[], fb_dtsg: string, isForceRun: bool = false) {
    return Promise.all(
        accounts.map(async (account, index) => {
            if (!isForceRun && !actionRunning.value) return;
            await wait(index * delaySingleThread.value);
            try {
                // if (!isForceRun && !actionRunning.value) return;
                // var response = await SendRequestFtech(uid, account, fb_dtsg);
                // SetActionStateValue(response, account);
                chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                  var activeTab = tabs[0];
                  var script = GetRequestFtechUnFriendScript(uid, account, fb_dtsg);
                  // // TODO: Uncomment khi build
                  var response = chrome.tabs.executeScript(activeTab.id, { code: script });
                  SetActionStateValue(response, account);
                });
            } catch (error) {
                console.log(error.message);
            }
        })
    )
}

const wait = function(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    });
}

var indexRunningAccount = ref(0)

// Cập nhật thông tin kết quả chạy từ Response API
const SetActionStateValue = function(response, account) {
  runCount.value = runCount.value + 1;
}

const stopLoginAction = function() {
    actionRunning.value = false;
}

const downloadFileByContent = function(fileContent, filename) {
    // Create a Blob from the data
    const blob = new Blob([fileContent], { type: 'text/plain' });

    // Create a link element
    const link = document.createElement('a');

    // Set the link's href attribute to a data URL containing the blob data
    link.href = window.URL.createObjectURL(blob);

    // Specify the file name for the download
    link.download = filename;

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click event on the link to start the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);
}

const selected = ref([]);
const allSelected = ref(false);
const selectAll = function() {
  userList.value.forEach(user => {
    user.selected = allSelected.value;
  });
};
const searchUID = ref("")
var rawFriends = [];

const downloadUIDs = function(){
  // TODO: Tải các UID được chọn
  let downloadUIDs = userList.value.filter(user => !!user.selected).map(x=>x.id + "|" + x.name);
  if (!downloadUIDs || !downloadUIDs.length) {
    alert("Chưa chọn UID để tải");
    return;
  }
  var timeStamp = Date.now();
  var dateTimeInfo = `${new Date(Date.now()).getFullYear()}${new Date(Date.now()).getMonth() + 1}${new Date(Date.now()).getDay()}_${new Date(Date.now()).getHours()}${new Date(Date.now()).getMinutes()}`
  downloadFileByContent(downloadUIDs.join('\n'), `live_${dateTimeInfo}_${timeStamp}.txt`);
}

var URL_TOKEN = '';
var EAAB_TOKEN = '';
const reloadUID = function(){
  actionRunning.value = true;
  loadStatus.value = 0;
  if (EAAB_TOKEN.length) {
    loadUIDByToken(EAAB_TOKEN);
  } else {
    if (URL_TOKEN.length > 0) {
      loadUIDByURLPage(URL_TOKEN);
    } else {
      GetEAABTokenURL().then((rawHtml) => {
        // Lấy Url trang web chứa Token
        URL_TOKEN  = GetUrlTokenEAABByDocument(rawHtml);
        if (!URL_TOKEN) {
          alert("Lỗi load Token.")
          actionRunning.value = false;
          loadStatus.value = 2;
        } else {
          loadUIDByURLPage(URL_TOKEN);
        }
      }).catch((err)=> {
        actionRunning.value = false;
        loadStatus.value = 2;
      })
    }
  }
}

const loadUIDByURLPage = function(url: string){
  // Lấy Token EAAB
  GetEAABToken(url).then(async (resHtml)=> {
    EAAB_TOKEN = GetTokenEAABByDOM(resHtml);

    // Lấy thành công => Load danh sách bạn bè
    if (!EAAB_TOKEN) {
      alert("Token trống")
      actionRunning.value = false;
      loadStatus.value = 2;
    } else {
      loadUIDByToken(EAAB_TOKEN);
    }
  }).catch((error)=> {
    actionRunning.value = false;
    loadStatus.value = 2;
  })
}

const loadUIDByToken = async function(token: string){
  loadStatus.value = 1;
  userList.value = [];
  let friendPagings = await GetAllFriendByToken(token);
  actionRunning.value = false;
  loadStatus.value = 2;
  if (friendPagings && friendPagings.length) {
    rawFriends = [];
    friendPagings.forEach(friendPaging => {
      if (friendPaging && friendPaging.length > 0){
        friendPaging.forEach(friend => {
          if (!friend) return;
          friend.status = 1;
          friend.birth_day = "--";
          friend.description = "--";
          userList.value.push(friend);
          rawFriends.push(friend);
          
        });
      }
    });
  }
}

const searchUIDTable = function(){
  let filterVaue = searchUID.value;
  if (filterVaue && filterVaue.indexOf(" ") > 0) {
    let filterUIDs = filterVaue.split(" ").filter(x=>(x.length > 0 && x.trim().length > 0));
    userList.value = rawFriends.filter(friend => friend.id && filterUIDs.indexOf(friend.id) >=0);
  } else {
    userList.value = rawFriends.filter(friend => friend.id && friend.id.indexOf(filterVaue) >=0);
  }
}

const loadStatus = ref(2); // 0=> Đang lấy Token, 1: Đang load danh sách bạn bè, 2: Load xong


const navigationTab = ref('Dịch vụ')
const tabItems = ['Dịch vụ', 'Tìm kiếm bài viết']
const scriptRunCount = ref(0)
const threadScriptReset = ref(0); // Reset Dcom sau mỗi 1800 Request
const scriptParams = ref("##email##")
const paramsValue = ref("")
const delayScriptThread = ref(2)
// const scriptTitles = ref([        
//         { id: 1, name: 'ADD MAIL' },
//         { id: 2, name: 'Xóa SĐT' },
//         { id: 3, name: 'CHANGE PASS' }])
const scriptTitles = ref(["ADD MAIL", "Xóa SĐT", "CHANGE PASS", "CUSTOM"]);
const scriptSelected = ref("CUSTOM")
const runScript = ref(GetScriptByModel("ADD MAIL", "uid", "fb_dtsg"));

const changeScript = function(scriptMode: string){
  runScript.value = GetScriptByModel(scriptMode);
}


const RunScriptAction = function() {
  // alert(isRecentPost.value)
  // return;
  var searchKeyword = paramsValue.value.trim();
  scriptRunCount.value = 0;
  if (!searchKeyword || searchKeyword.length == 0) {
      alert("Chưa nhập Keyword...");
      return;
  }

  actionRunning.value = true;
  // RunScriptActionByConfig("uid", accounts);
  chrome.cookies.getAll({ domain: '.facebook.com' }, cookies => {
    let uidCookie = cookies.find(cookie => cookie.name == "c_user");
    if (uidCookie && uidCookie.value) {
      ACCOUNT_UID = uidCookie.value;
      if (ACCOUNT_FB_DTSG.length > 0) {
          RunSearchScriptActionByConfig(null, uidCookie.value, searchKeyword, ACCOUNT_FB_DTSG);
      } else {
        GetFB_DtsgValue().then((dtsgval: string)=> {
          ACCOUNT_FB_DTSG = dtsgval;
          if (dtsgval.length > 0) {
              RunSearchScriptActionByConfig(null, uidCookie.value, searchKeyword, dtsgval);
            // RunScriptActionByConfig("", uidCookie.value, accounts, dtsgval);
          } else {
            alert("Có lỗi xảy ra. Vui lòng thử lại")
          }
        })
      }
    } else {
      alert("Chưa đăng nhập Facebook...")
    }
  });
}

const BaseRunScriptAction = function() {
  var accounts = paramsValue.value.split('\n').filter(x => x && x.trim().length);
  scriptRunCount.value = 0;
  if (!accounts || accounts.length == 0) {
      alert("Chưa nhập Email...");
      return;
  }

  actionRunning.value = true;
  // RunScriptActionByConfig("uid", accounts);
  chrome.cookies.getAll({ domain: '.facebook.com' }, cookies => {
    let uidCookie = cookies.find(cookie => cookie.name == "c_user");
    if (uidCookie && uidCookie.value) {
      ACCOUNT_UID = uidCookie.value;
      if (ACCOUNT_FB_DTSG.length > 0) {
        chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
          RunScriptActionByConfig(tabs[0].id, uidCookie.value, accounts, ACCOUNT_FB_DTSG);
        });
      } else {
        GetFB_DtsgValue().then((dtsgval: string)=> {
          ACCOUNT_FB_DTSG = dtsgval;
          if (dtsgval.length > 0) {
            chrome.tabs.query({ active: true, currentWindow: true }, async function(tabs) {
              RunScriptActionByConfig(tabs[0].id, uidCookie.value, accounts, dtsgval);
            });
            // RunScriptActionByConfig("", uidCookie.value, accounts, dtsgval);
          } else {
            alert("Có lỗi xảy ra. Vui lòng thử lại")
          }
        })
      }
    } else {
      alert("Chưa đăng nhập Facebook...")
    }
  });
}

const RunSearchScriptActionByConfig = async function(tabID: any, uid: string, keyword: string, fb_dtsg: string) {
  let index = 0;
  runCount.value = 0;
  let actionAccounts = []

  actionAccounts.push(keyword);
  // if (actionAccounts.length == threadCountReset.value) {
      if (!actionRunning.value) return;
      var tempActionAccounts = JSON.parse(JSON.stringify(actionAccounts));
      await RunActionThreadScriptByKeyword(tabID, uid, tempActionAccounts, fb_dtsg);
      actionAccounts = [];
      await wait(delayScriptThread.value * 1000);
  // }

  // if (index + 1 <= actionAccounts.length) {
  //   RunActionThreadScriptByKeyword(tabID, uid, actionAccounts, fb_dtsg, true).then((res) => {
  //       alert("Hoàn thành")
  //     }).catch((err) => {
  //         console.log(err);
  //     });

  //     actionRunning.value = false;
  //     return;
  // } 
}

const SearchPostByKeyWord = async function(uid: string ,keyword: string ,fb_dtsg: string) {
  // var cur_sor = 'AbqB5qnOdOSi0FB86Phf9XJmgKokta98ONdXGthmEAgbB8HPIXOjj7h_7OkduXILlsKtpvTYVuZnFFuknqqomacLdDWqjyPTSVofFxwsWkR6ERM4vIPtsMvkuAzDmLRq4QgmjrHPSSVt-W_CUkDB_Zyb1Pywm3pcgipKFzYRlV1RtkYrgMTQgGk2kwTZI7l0kLdsuN8ULk7bAansq8TRBoCqpY5ryDy4Kp6k1V2yIxb8MYrBcOG6if6xI27A_N9uTdOmEMX6__TINu4qBB-iPr0_njk7hMgEzs2zRmBV-Jen8iBw4hdDDEeoelWm6EGqNOwKaFH9Q5y6inMF9-GiPtzoGEu3dE0smizbrAyZWAl1DpfinX3dtx8CSSZH0d1F7pWufnN5gVDjtn1VNweV_YBxFRo4-imrYPTeX1lLw5V0eRuGmW46fy0n8M8kai33GT0BHnDh_hZfywlS24ayqyOPTM0K9vYdOgIsb650zFbksxaTNZVkoMgXT7YNM_8Qay6wCggeqpJNCkabbpIfYGtA97rX_Bv4i-ouA1mnrToehuo-WDJFQ-ItkKvS-pthVrd04bHGSsPIpbzHDgyr1rFeJGW6iajT_VdNDj4Arup2gt5z0qGkEDIsb1oXMPyjUPcd4UtrSb04qXIZ45_jIdwP8RNAvafJmi5vGamS7HE9Tf0FOE0rfPbndQlPkqJXUe_IVE-4A_hBRxmicH9YwbbwHs53e0NqzBtV7dPZGwBJmWA-hGWvnUAJBm52E6ZV8kTbvxN-7gvtckY4bgWRCugEtWvf9HnAwVFt_Aody92WinXSIoh3vP7ejU2XsILjp1CsBp-K3mxqr0asV9ObrRC7BW1bZrxlhrNF8znTsFnjlBA7BcE8luyDudmSjZZD8jHVIZUmzGmUw3ZbdXD6SrN46gmxxhYvp02CEd4jj9n1crEiHQJqCk14Z-gUqcjLDvpWZxYRirjKyjUcQWVDZKzQF4_lvyPf5bfLro2QaB-kTHEMZWaxxReYRHfw94-vSglPJ2vGLOC64vVBMUuOGfCD9QEtYfg1dEiClhD41s0EofNgiuamrHNQ6Y3996WBhG9Xo7p2GEb-rbBWGL0iIGJcm6Q9W-LkOt7fbjF2hP8_ASm-EThTmCzlfbqSdlL2yk8E1lS2ZrHaCX5cujlq5a8rAGe9v8Tw0PwA3DSEwAVGfJ3NdJnu2bn8MtHyDZqmkS6XL8wjaptTTIwd1qEXrbdCrD_bpF30KO2c4Z4CKihaTndAsmHbO8Jg0ilTf8TKL-MtrVv-hD96L1DrWlvrFuRnuFe0KJ0KhM0iWimksrYfSr9rGAUWFMzHNowNvvaOtKBBf8u3YAvzJy-VP60evCfxDGz8O5WdXVP9NUKF691SjAbfQMuu-Iqr67vZMIWMpbGdX9mpvirS4iiZZZY_G4jlY6_9sqHLiriWjM9Pg0m-YAqdq0dZ-9W5EAUjgcjNWCtb5MZZrmbEIi00h7pHVUBV-PUhXXYMF918tMovR3pGdD0dCZQCeLLOyegTubAyFISHgSphqMHNQ_jEDhY9Awoa0N3UpWLGqGCulNi6_K_YxP2kpp-YdeswsR1bhQQOjPmj_oyEhU3ZyaKBq7C01F8cHKOVlmh5Mlrp77hESmqG0jGyGRRywBpmf4MzKq1UhcOxlNhgBvTx7a1hKs6hIEXVFzUq77gJX_5CZt0cfAuYZX0b_mGXLmUzNIsrHTAKSHzVWya1NEOrAZq8XS4z37svJv9zGgb-GZjELZYRSSEOog3JkEqvMnB_ys-y1UmKI4aC2dIQkHYR-OAK5-ZbuvyI22eevJGhCEmKDWlRx_ZBK8ofGjo4xmnv5FAIrjsVFAVaM2_RPKxAppAKpV7oVlvZzBnsSUOVOYA54Q8rmPnqBaX52PhZqi_dP3enqwaXCfb3RLrcShJE6ENbXo11a9Lica3Z5uH3p_xEAQrd1BeB7UIZPi_mMeHPwtk6hxJHymMLLGT6L77KifPhDelTvJyk3Sv2KrxRMUo65v6MU_kEwt6p8-CuL9At0PyvKy2dXDo_vXTN9e_3pwaQmFteK1vWKIOtoVxAQ2NNG0Uw8fK0qHsgNUN5rSsPBmQC34icOqd_8hrpSj79njlP8QbxVUVZPk9t5i4CPMfs9hgACy5zEdgntz8_lYPI8QMYWyQokmN-MIjx7ywohXB-R4OQWyDDxjLEGXLIxppxIkwoDSOjQj1vlDWF_xdjzgb-dYFs6PSkL2nEjDHxWYj1JhLwQ7tYS9iI5recpK1vjAgyJTkXjio8GF78OQ32Bbdv3c5nlyMRq6L7OJHtoevdCAGqXsJoFkYK4v83G_dVdWofXh0G7WoCgfKvIUDIPHS12Xk_4dId6w7OEWAISLLLIIBu0uVEx2HRTWaCGB4BCNlmv_QCNw';
  var cur_sor = 'AbqB5qnOdOSi0FB86Phf9XJmgKokta98ONdXGthmEAgbB8HPIXOjj7k_7OkduXILlsKtpvTYVuZnFFuknqqomacLdDWqjyPTSVofFxwsWkR6ERM4vIPtsMvkuAzDmLRq4QgmjrHPSSVt-W_CUkDB_Zyb1Pywm3pcgipKFzYRlV1RtkYrgMTQgGk2kwTZI7l0kLdsuN8ULk7bAansq8TRBoCqpY5ryDy4Kp6k1V2yIxb8MYrBcOG6if6xI27A_N9uTdOmEMX6__TINu4qBB-iPr0_njk7hMgEzs2zRmBV-Jen8iBw4hdDDEeoelWm6EGqNOwKaFH9Q5y6inMF9-GiPtzoGEu3dE0smizbrAyZWAl1DpfinX3dtx8CSSZH0d1F7pWufnN5gVDjtn1VNweV_YBxFRo4-imrYPTeX1lLw5V0eRuGmW46fy0n8M8kai33GT0BHnDh_hZfywlS24ayqyOPTM0K9vYdOgIsb650zFbksxaTNZVkoMgXT7YNM_8Qay6wCggeqpJNCkabbpIfYGtA97rX_Bv4i-ouA1mnrToehuo-WDJFQ-ItkKvS-pthVrd04bHGSsPIpbzHDgyr1rFeJGW6iajT_VdNDj4Arup2gt5z0qGkEDIsb1oXMPyjUPcd4UtrSb04qXIZ45_jIdwP8RNAvafJmi5vGamS7HE9Tf0FOE0rfPbndQlPkqJXUe_IVE-4A_hBRxmicH9YwbbwHs53e0NqzBtV7dPZGwBJmWA-hGWvnUAJBm52E6ZV8kTbvxN-7gvtckY4bgWRCugEtWvf9HnAwVFt_Aody92WinXSIoh3vP7ejU2XsILjp1CsBp-K3mxqr0asV9ObrRC7BW1bZrxlhrNF8znTsFnjlBA7BcE8luyDudmSjZZD8jHVIZUmzGmUw3ZbdXD6SrN46gmxxhYvp02CEd4jj9n1crEiHQJqCk14Z-gUqcjLDvpWZxYRirjKyjUcQWVDZKzQF4_lvyPf5bfLro2QaB-kTHEMZWaxxReYRHfw94-vSglPJ2vGLOC64vVBMUuOGfCD9QEtYfg1dEiClhD41s0EofNgiuamrHNQ6Y3996WBhG9Xo7p2GEb-rbBWGL0iIGJcm6Q9W-LkOt7fbjF2hP8_ASm-EThTmCzlfbqSdlL2yk8E1lS2ZrHaCX5cujlq5a8rAGe9v8Tw0PwA3DSEwAVGfJ3NdJnu2bn8MtHyDZqmkS6XL8wjaptTTIwd1qEXrbdCrD_bpF30KO2c4Z4CKihaTndAsmHbO8Jg0ilTf8TKL-MtrVv-hD96L1DrWlvrFuRnuFe0KJ0KhM0iWimksrYfSr9rGAUWFMzHNowNvvaOtKBBf8u3YAvzJy-VP60evCfxDGz8O5WdXVP9NUKF691SjAbfQMuu-Iqr67vZMIWMpbGdX9mpvirS4iiZZZY_G4jlY6_9sqHLiriWjM9Pg0m-YAqdq0dZ-9W5EAUjgcjNWCtb5MZZrmbEIi00h7pHVUBV-PUhXXYMF918tMovR3pGdD0dCZQCeLLOyegTubAyFISHgSphqMHNQ_jEDhY9Awoa0N3UpWLGqGCulNi6_K_YxP2kpp-YdeswsR1bhQQOjPmj_oyEhU3ZyaKBq7C01F8cHKOVlmh5Mlrp77hESmqG0jGyGRRywBpmf4MzKq1UhcOxlNhgBvTx7a1hKs6hIEXVFzUq77gJX_5CZt0cfAuYZX0b_mGXLmUzNIsrHTAKSHzVWya1NEOrAZq8XS4z37svJv9zGgb-GZjELZYRSSEOog3JkEqvMnB_ys-y1UmKI4aC2dIQkHYR-OAK5-ZbuvyI22eevJGhCEmKDWlRx_ZBK8ofGjo4xmnv5FAIrjsVFAVaM2_RPKxAppAKpV7oVlvZzBnsSUOVOYA54Q8rmPnqBaX52PhZqi_dP3enqwaXCfb3RLrcShJE6ENbXo11a9Lica3Z5uH3p_xEAQrd1BeB7UIZPi_mMeHPwtk6hxJHymMLLGT6L77KifPhDelTvJyk3Sv2KrxRMUo65v6MU_kEwt6p8-CuL9At0PyvKy2dXDo_vXTN9e_3pwaQmFteK1vWKIOtoVxAQ2NNG0Uw8fK0qHsgNUN5rSsPBmQC34icOqd_8hrpSj79njlP8QbxVUVZPk9t5i4CPMfs9hgACy5zEdgntz8_lYPI8QMYWyQokmN-MIjx7ywohXB-R4OQWyDDxjLEGXLIxppxIkwoDSOjQj1vlDWF_xdjzgb-dYFs6PSkL2nEjDHxWYj1JhLwQ7tYS9iI5recpK1vjAgyJTkXjio8GF78OQ32Bbdv3c5nlyMRq6L7OJHtoevdCAGqXsJoFkYK4v83G_dVdWofXh0G7WoCgfKvIUDIPHS12Xk_4dId6w7OEWAISLLLIIBu0uVEx2HRTWaCGB4BCNlmv_QCNw';
  // console.log(results[0].id + " 1====> " + script);
  scanPosts.value = [];
  var isScanRecentPost = isRecentPost.value;
  const getNextCursor = function(responseGraph){
    try {
      if (responseGraph.data.serpResponse.results.page_info.has_next_page == true) return responseGraph.data.serpResponse.results.page_info.end_cursor;
    } catch(error) {
      console.log("Lỗi load page bài viết tiếp theo...");
      console.log(error)      
    } 
  };
  while (cur_sor && actionRunning.value) {
    var response = null;
    try {
      var maxReloadPosts = 5;
      while (maxReloadPosts > 0 && (!response || !response.data || !response.data.serpResponse || !response.data.serpResponse.results || !response.data.serpResponse.results.edges)) {
        maxReloadPosts = maxReloadPosts - 1;
        try {
          response = await SendQueryRequestFtech(uid, keyword, fb_dtsg, cur_sor, isScanRecentPost);
        } catch(error) {
          console.log("Lỗi API");
          console.log(error);
        }
        await wait(delayScriptThread.value * 1000);
      }

      cur_sor = getNextCursor(response);
      await wait(300);
      
      let posts = response.data.serpResponse.results.edges;
      // console.log(posts);
      posts.forEach(post => {
        try {
          if (post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.attached_story) return;
          if (JSON.parse(post.relay_rendering_strategy.view_model.click_model.story.comet_sections.call_to_action.story.tracking).video_id) return;
        } catch(error) {
          
        }
        try {
          // scanPosts.value.push(`https://www.facebook.com/${post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.post_id}|${post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.message ? post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.message.text : ""}` + "|" + (JSON.parse(post.relay_rendering_strategy.view_model.click_model.story.comet_sections.call_to_action.story.tracking).video_id ? JSON.parse(post.relay_rendering_strategy.view_model.click_model.story.comet_sections.call_to_action.story.tracking).video_id : (JSON.parse(post.relay_rendering_strategy.view_model.click_model.story.comet_sections.call_to_action.story.tracking).photo_attachments_list ? JSON.parse(post.relay_rendering_strategy.view_model.click_model.story.comet_sections.call_to_action.story.tracking).photo_attachments_list.join(',') : JSON.parse(post.relay_rendering_strategy.view_model.click_model.story.comet_sections.call_to_action.story.tracking).photo_id)));
          let actorIds = '';
          let postActors = post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.actors;
          if (postActors && postActors.length > 0) actorIds = post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.actors.map(x=>x.id).join(',');

          var scanValue = `${post.relay_rendering_strategy.view_model.click_model.story.comet_sections.content.story.post_id}|${actorIds}`;
          scanPosts.value.push(scanValue);
          console.log(scanPosts.value.length);
          searchResults.value = `ĐÃ QUÉT ${scanPosts.value.length} BÀI VIẾT` + '\n' + '\n' + scanPosts.value.filter((x,index) => index <100).join('\n');
          scriptRunCount.value = scanPosts.value.length;
        } catch(error) {
          console.log("Lỗi đọc thông tin bài viết... ");
          console.log(error);
        }
      });
    } catch(error) {
      console.log("Lỗi tải bài viết mới");
      console.log(error);
      console.log(response);
    }
  }
  
  downloadData(keyword);
  actionRunning.value = false;
  // SetRunScriptStateValue(response, keyword);
}

const downloadData = function(keyword: string){
  if (!keyword) keyword = paramsValue.value;
  var timeStamp = Date.now();
  var dateTimeInfo = `${new Date(Date.now()).getFullYear()}${new Date(Date.now()).getMonth() + 1}${new Date(Date.now()).getDay()}_${new Date(Date.now()).getHours()}${new Date(Date.now()).getMinutes()}`
  downloadFileByContent(`TỪ KHOÁ TÌM KIẾM: ${paramsValue.value} \n\n` + scanPosts.value.join('\n'), `${scanPosts.value.length}_Baiviet_${dateTimeInfo}_${timeStamp}.txt`);
}


const RunActionThreadScriptByKeyword = async function(tabID: any, uid: string, keywords: string[], fb_dtsg: string, isForceRun: bool = false) {
    return Promise.all(
      keywords.map(async (keyword, index) => {
        await wait(index * delayScriptThread.value * 1000);
        try {
            // var script = SendQueryRequestFtech(keyword, uid, fb_dtsg);
            chrome.tabs.query({url: "https://www.facebook.com/search/*"}, async function(results) {
              if (results.length != 0) {
                  // var cur_sor = 'AbqB5qnOdOSi0FB86Phf9XJmgKokta98ONdXGthmEAgbB8HPIXOjj7h_7OkduXILlsKtpvTYVuZnFFuknqqomacLdDWqjyPTSVofFxwsWkR6ERM4vIPtsMvkuAzDmLRq4QgmjrHPSSVt-W_CUkDB_Zyb1Pywm3pcgipKFzYRlV1RtkYrgMTQgGk2kwTZI7l0kLdsuN8ULk7bAansq8TRBoCqpY5ryDy4Kp6k1V2yIxb8MYrBcOG6if6xI27A_N9uTdOmEMX6__TINu4qBB-iPr0_njk7hMgEzs2zRmBV-Jen8iBw4hdDDEeoelWm6EGqNOwKaFH9Q5y6inMF9-GiPtzoGEu3dE0smizbrAyZWAl1DpfinX3dtx8CSSZH0d1F7pWufnN5gVDjtn1VNweV_YBxFRo4-imrYPTeX1lLw5V0eRuGmW46fy0n8M8kai33GT0BHnDh_hZfywlS24ayqyOPTM0K9vYdOgIsb650zFbksxaTNZVkoMgXT7YNM_8Qay6wCggeqpJNCkabbpIfYGtA97rX_Bv4i-ouA1mnrToehuo-WDJFQ-ItkKvS-pthVrd04bHGSsPIpbzHDgyr1rFeJGW6iajT_VdNDj4Arup2gt5z0qGkEDIsb1oXMPyjUPcd4UtrSb04qXIZ45_jIdwP8RNAvafJmi5vGamS7HE9Tf0FOE0rfPbndQlPkqJXUe_IVE-4A_hBRxmicH9YwbbwHs53e0NqzBtV7dPZGwBJmWA-hGWvnUAJBm52E6ZV8kTbvxN-7gvtckY4bgWRCugEtWvf9HnAwVFt_Aody92WinXSIoh3vP7ejU2XsILjp1CsBp-K3mxqr0asV9ObrRC7BW1bZrxlhrNF8znTsFnjlBA7BcE8luyDudmSjZZD8jHVIZUmzGmUw3ZbdXD6SrN46gmxxhYvp02CEd4jj9n1crEiHQJqCk14Z-gUqcjLDvpWZxYRirjKyjUcQWVDZKzQF4_lvyPf5bfLro2QaB-kTHEMZWaxxReYRHfw94-vSglPJ2vGLOC64vVBMUuOGfCD9QEtYfg1dEiClhD41s0EofNgiuamrHNQ6Y3996WBhG9Xo7p2GEb-rbBWGL0iIGJcm6Q9W-LkOt7fbjF2hP8_ASm-EThTmCzlfbqSdlL2yk8E1lS2ZrHaCX5cujlq5a8rAGe9v8Tw0PwA3DSEwAVGfJ3NdJnu2bn8MtHyDZqmkS6XL8wjaptTTIwd1qEXrbdCrD_bpF30KO2c4Z4CKihaTndAsmHbO8Jg0ilTf8TKL-MtrVv-hD96L1DrWlvrFuRnuFe0KJ0KhM0iWimksrYfSr9rGAUWFMzHNowNvvaOtKBBf8u3YAvzJy-VP60evCfxDGz8O5WdXVP9NUKF691SjAbfQMuu-Iqr67vZMIWMpbGdX9mpvirS4iiZZZY_G4jlY6_9sqHLiriWjM9Pg0m-YAqdq0dZ-9W5EAUjgcjNWCtb5MZZrmbEIi00h7pHVUBV-PUhXXYMF918tMovR3pGdD0dCZQCeLLOyegTubAyFISHgSphqMHNQ_jEDhY9Awoa0N3UpWLGqGCulNi6_K_YxP2kpp-YdeswsR1bhQQOjPmj_oyEhU3ZyaKBq7C01F8cHKOVlmh5Mlrp77hESmqG0jGyGRRywBpmf4MzKq1UhcOxlNhgBvTx7a1hKs6hIEXVFzUq77gJX_5CZt0cfAuYZX0b_mGXLmUzNIsrHTAKSHzVWya1NEOrAZq8XS4z37svJv9zGgb-GZjELZYRSSEOog3JkEqvMnB_ys-y1UmKI4aC2dIQkHYR-OAK5-ZbuvyI22eevJGhCEmKDWlRx_ZBK8ofGjo4xmnv5FAIrjsVFAVaM2_RPKxAppAKpV7oVlvZzBnsSUOVOYA54Q8rmPnqBaX52PhZqi_dP3enqwaXCfb3RLrcShJE6ENbXo11a9Lica3Z5uH3p_xEAQrd1BeB7UIZPi_mMeHPwtk6hxJHymMLLGT6L77KifPhDelTvJyk3Sv2KrxRMUo65v6MU_kEwt6p8-CuL9At0PyvKy2dXDo_vXTN9e_3pwaQmFteK1vWKIOtoVxAQ2NNG0Uw8fK0qHsgNUN5rSsPBmQC34icOqd_8hrpSj79njlP8QbxVUVZPk9t5i4CPMfs9hgACy5zEdgntz8_lYPI8QMYWyQokmN-MIjx7ywohXB-R4OQWyDDxjLEGXLIxppxIkwoDSOjQj1vlDWF_xdjzgb-dYFs6PSkL2nEjDHxWYj1JhLwQ7tYS9iI5recpK1vjAgyJTkXjio8GF78OQ32Bbdv3c5nlyMRq6L7OJHtoevdCAGqXsJoFkYK4v83G_dVdWofXh0G7WoCgfKvIUDIPHS12Xk_4dId6w7OEWAISLLLIIBu0uVEx2HRTWaCGB4BCNlmv_QCNw';
                  // // console.log(results[0].id + " 1====> " + script);
                  // var response = await SendQueryRequestFtech(uid, keyword, fb_dtsg, cur_sor);
                  // SetRunScriptStateValue(response, keyword);
                  SearchPostByKeyWord(uid, keyword, fb_dtsg)
              } else {
                chrome.tabs.create({ url: `https://www.facebook.com/search/posts?q=${keyword}` },async function(tab){
                  // console.log(tab.id + " 2====> " + script);
                  setTimeout(() => {
                    chrome.tabs.query({url: "https://www.facebook.com/search/*"}, async function(results) {
                      // var response = chrome.tabs.executeScript(results[0].id, { code: script })
                      // SetRunScriptStateValue(response, keyword);
                      SearchPostByKeyWord(uid, keyword, fb_dtsg)
                    })                    
                  }, 1000);
                });
              }
            })

            // chrome.tabs.query({url: "https://www.facebook.com/search/*"}, function(results) {
            //   if (results.length == 0) {
            //       chrome.tabs.create({url: 'http://www.pandora.com/'}, function(tab) {
            //           chrome.tabs.executeScript(tab.id,{file: "buy.js"});
            //       });
            //   }
            // });
            // var response = chrome.tabs.executeScript(tabID, { code: script })
            
        } catch (error) {
            console.log(error.message);
        }
      })
    )
}


const GetScriptSearchActionOnParam = function(paramsValue: string, uid: string, fb_dtsg: string) : string{
  var script = `${runScript.value}`; // script: .... ##email##... 
  let paramsPropValue = `${paramsValue}|${uid}|${fb_dtsg}`.split('|');
  var paramProps = `${scriptParams.value}|##uid##|##fb_dtsg##`; //##email##
  paramProps.split('|').forEach((paramProp, index) => {
    if (paramsPropValue.length > index) script = script.replace(paramProp, paramsPropValue[index])
  });
  return script;
}

const RunScriptActionByConfig = async function(tabID: any, uid: string, accounts: string[], fb_dtsg: string) {
  let index = 0;
  runCount.value = 0;
  let actionAccounts = []
  for (index = 0; index < accounts.length; index++) {
    actionAccounts.push(accounts[index]);
    if (actionAccounts.length == threadCountReset.value) {
        if (!actionRunning.value) return;
        var tempActionAccounts = JSON.parse(JSON.stringify(actionAccounts));
        await RunActionThreadScriptByAccounts(tabID, uid, tempActionAccounts, fb_dtsg);
        actionAccounts = [];
        await wait(threadScriptReset.value * 1000);
    }

    if (index + 1 == accounts.length ) {
      RunActionThreadScriptByAccounts(tabID, uid, actionAccounts, fb_dtsg, true).then((res) => {
        }).catch((err) => {
            console.log(err);
        });

        actionRunning.value = false;
        return;
    }
  }
}

const RunActionThreadScriptByAccounts = async function(tabID: any, uid: string, accounts: string[], fb_dtsg: string, isForceRun: bool = false) {
    return Promise.all(
        accounts.map(async (account, index) => {
            if (!actionRunning.value) return;
            await wait(index * delayScriptThread.value * 1000);
            try {
                if (!actionRunning.value) return;
                var script = GetScriptActionOnParam(account, uid, fb_dtsg);
                var response = chrome.tabs.executeScript(tabID, { code: script });
                SetRunScriptStateValue(response, account);
                
            } catch (error) {
                console.log(error.message);
            }
        })
    )
}

// Cập nhật thông tin kết quả chạy từ Response API
const SetRunScriptStateValue = function(response, account) {
  scriptRunCount.value = scriptRunCount.value + 1;
}


const GetScriptActionOnParam = function(paramsValue: string, uid: string, fb_dtsg: string) : string{
  var script = `${runScript.value}`; // script: .... ##email##... 
  let paramsPropValue = `${paramsValue}|${uid}|${fb_dtsg}`.split('|');
  var paramProps = `${scriptParams.value}|##uid##|##fb_dtsg##`; //##email##
  paramProps.split('|').forEach((paramProp, index) => {
    if (paramsPropValue.length > index) script = script.replace(paramProp, paramsPropValue[index])
  });
  return script;
}

const GetTitleParam = function(){
  var accounts = paramsValue.value.split('\n').filter(x => x && x.trim().length);
  if (!accounts || accounts.length == 0) {
    return "Từ khoá tìm kiếm";
  } else {
    return `Số lượng ${accounts.length}`
  }
  
}
</script>

<template>
  <VRow class="match-height">
    <VCol cols="12" md="12">
      <VCard>
        <VTabs v-model="navigationTab">
          <VTab
            v-for="item in tabItems"
            :key="item"
            :value="item"
          >
            {{ item }}
          </VTab>
        </VTabs>

        <VDivider />

        <!-- tabs content -->
        <VWindow v-model="navigationTab">
          <VWindowItem
            key="Dịch vụ"
            value="Dịch vụ"
          >
            <VCard title="Đăng nhập với Cookie" class="position-relative">
              <VRow class="mr-2">
                  <VCol cols="12">
                      <VRow class="ml-2">
                        <VCol cols="12">
                          <span class="font-weight-regular mt-2"> 
                            <VBtn v-if="!actionRunning" v-bind:disabled="actionRunning" color="success" @click="runLoginWithCookie">                 
                              <VIcon
                                size="24"
                                icon="mdi-account-plus-outline"
                                class="mr-2"
                              />Đăng nhập</VBtn>
                          </span>
                          <span class="font-weight-regular mt-2 ml-2"> 
                            <VBtn v-if="!actionRunning" v-bind:disabled="actionRunning" color="primary" @click="CopyCookie">                 
                              <VIcon
                                size="24"
                                icon="mdi-clipboard-check-outline"
                                class="mr-2"
                              />Copy Cookie</VBtn>
                          </span>
                          
                        </VCol>  
                        
                        <VCol cols="12" class="pb-2 mb-4">
                            <v-textarea rows="25" v-model="accountCookie" label="Cookie tài khoản"></v-textarea>
                        </Vcol>
                      </VRow>

                  </Vcol>
              </VRow>
            </VCard>
          </VWindowItem>

          <VWindowItem
          key="Bạn bè"
          value="Bạn bè"
        >
        <VCard>
          <VRow class="mr-2">
            <VCol cols="6" md="6">
              <span
                class="d-flex align-center cursor-pointer"
                style=" margin-top: 8px;user-select: none;"
              >
                <span style="width: 260px; padding-left: 8px;">
                  <VTextField
                    v-model="searchUID"
                    @change="searchUIDTable"
                    prepend-inner-icon="mdi-magnify"
                    label="Search"
                  />
                </span>
              </span>
            </VCol>
  
            <VCol cols="6" md="6" class="d-flex flex-row-reverse align-right">
              <span v-bind:disabled="actionRunning" class="font-weight-regular mt-2" style="padding-top: 12px; margin-left: 6px;"> 
                <VBtn  color="primary" @click="downloadUIDs">                 
                  <VIcon
                    size="24"
                    icon="mdi-cloud-download-outline"
                    class="mr-2"
                  />Tải UID</VBtn>
              </span>
              <span v-bind:disabled="actionRunning" class="font-weight-regular mt-2" style="padding-top: 12px;margin-left: 6px;"> 
                <VBtn color="success" @click="reloadUID">                 
                  <VIcon
                    size="24"
                    icon="mdi-cloud-check-outline"
                    class="mr-2"
                  />Load</VBtn>
                
              </span>
              <span v-if="loadStatus == 0" class="font-weight-regular mt-2" style="padding-top: 16px;">
                <span class="mt-2">
                  <span style="color: #56ca00; font-size: 16px; font-weight: bold;">
                    Token....
                  </span>
                </span>
              </span>
              <span v-if="loadStatus == 1" class="font-weight-regular mt-2" style="padding-top: 20px;">
                <span class="mt-2">
                  <span style="color: #56ca00; font-size: 16px; font-weight: bold;">
                    Loading....
                  </span>
                </span>
              </span>

            </VCol>
          </Vrow>

          <VTable
            :headers="headers"
            :items="userList"
            item-key="uid"
            class="table-rounded"
            hide-default-footer
            disable-sort
            fixed-header
            height=406
            show-select
          >
            <thead>
              <tr>
                <!-- <th><input type="checkbox" @click="selectAll" v-model="allSelected"></th> -->
                <th><VCheckbox @change="selectAll" v-model="allSelected" /></th>
                <th
                  v-for="header in headers"
                  :key="header"
                >
                  {{ header }}
                </th>
              </tr>
            </thead>
  
            <tbody>
              <tr
                v-for="row in userList"
                :key="row.id"
              >
                <td><VCheckbox v-model="row.selected" /></td>
                <td>
                  <div class="d-flex flex-column">
                    <h6 class="text-sm font-weight-medium">{{ row.id }}</h6>
                  </div>
                </td>
  
                <td class="text-sm" v-text="row.name" />
                <td>
                  <VChip
                    size="small"
                    :color="statusColor[status[row.status]]"
                    class="text-capitalize"
                    >
                    {{ status[row.status] }}
                  </VChip>
                </td>
                <!-- <td class="text-sm" v-text="row.birth_day" /> -->
  
                <td class="text-sm" v-text="`${row.description}`" />
                <td class="text-sm"> <VBtn size="small" color="primary" @click="copyAccountClipboard(row)">
                  <VIcon
                  size="20"
                  icon="mdi-clipboard-outline"
                  class="mr-2"
                />Copy</VBtn></td>
  
              </tr>
            </tbody>
          </VTable>
        </VCard>
        </VWindowItem>

        <VWindowItem
        key="Tìm kiếm bài viết"
        value="Tìm kiếm bài viết"
        >
          <VCard title="Cấu hình" class="position-relative">
            <VRow class="mr-2">
                <VCol cols="12">
                    <VRow class="ml-2">

                      <VCol cols="3" class="pb-2 mb-4">
                        <v-textarea rows="5" label="Từ khoá tìm kiếm" v-model="paramsValue"></v-textarea>
                      </Vcol>
                      <!-- <VCol    
                        cols="4"
                        md="4">
                      </Vcol> -->

                      <VCol cols="2" class="pb-2 mt-2">
                        <VTextField rows="1" type="number" v-model="delayScriptThread" label="Delay (s)"></VTextField>
                        <VCheckbox
                            class="mt-1"
                            v-model="isSimplePost"
                            label="Bài viết"
                            @change="changeCheckboxOptionDcom"
                          />
                        <VCheckbox
                            class="mt-2"
                            v-model="isRecentPost"
                            label="Bài viết gần đây"
                            @change="changeCheckboxOption"
                          />
                      </Vcol>

                      <VCol cols="6">
                        <span class="font-weight-regular mt-2"> 
                          <VBtn v-if="!actionRunning" v-bind:disabled="actionRunning" color="success"  class="mt-3" @click="RunScriptAction">                 
                            <VIcon
                              size="30"
                              icon="mdi-magnify"
                              class="mr-2"
                            />Tìm kiếm</VBtn>
                        </span>
                        <span class="font-weight-regular mt-2 ml-2"> 
                          <VBtn v-if="!actionRunning" v-bind:disabled="actionRunning" color="primary"  class="mt-3" @click="downloadData">                 
                            <VIcon
                              size="30"
                              icon="mdi-download"
                              class="mr-2"
                            />Tải kết quả</VBtn>
                        </span>
                        <span class="font-weight-regular"> 
                          <VBtn v-if="actionRunning" color="error" @click="stopLoginAction">                 
                            <VIcon
                              size="24"
                              icon="mdi-cancel"
                              class="mr-2"
                            />Stop</VBtn>
                        </span>
                        <span v-if="actionRunning" class="font-weight-regular ml-2"> 
                          <span class="me-3">
                            <VAvatar
                              color="success"
                              rounded
                              size="42"
                              class="elevation-1"
                            >
                              <VIcon
                                size="24"
                                icon="mdi-playlist-check"
                              />
                            </VAvatar>
                          </span>
                          <span class="mt-2">
                            <span class="text-caption">
                              Đã chạy {{scriptRunCount}}
                            </span>
                          </span>
                        </span>

                      </VCol>  

                      <!-- <VCol cols="8" class="pb-2">
                        <v-select
                          v-model="scriptSelected"
                          label="Script Mode"
                          :items="scriptTitles"
                          @update:modelValue="changeScript"
                        >
                      </v-select>
                      </Vcol> -->
                      <!-- <VCol v-if="scriptSelected == 'CUSTOM'" cols="4" class="pb-2 mb-4">
                        <v-textarea rows="9" v-model="paramsValue" v-bind:label="GetTitleParam()"></v-textarea>
                      </Vcol> -->

                      <!-- <VCol v-if="scriptSelected == 'CUSTOM'" cols="8" class="pb-2 mb-4">
                          <v-textarea rows="9" v-model='runScript' label="Kết quả thực hiện"></v-textarea>
                      </Vcol> -->

                      <VCol cols="12" class="pb-2 mb-4">
                          <v-textarea rows="20" v-model='searchResults' label="Kết quả thực hiện"></v-textarea>
                      </Vcol>
                    </VRow>
                </Vcol>
            </VRow>
          </VCard>
        </VWindowItem>
        </VWindow>
      </VCard>
    </VCol>
  </VRow> 
</template>

<style lang="scss">
@use "@layouts/styles/mixins" as layoutsMixins;

.v-card .triangle-bg {
  position: absolute;
  inline-size: 10.375rem;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.v-card .trophy {
  position: absolute;
  inline-size: 4.9375rem;
  inset-block-end: 2rem;
  inset-inline-end: 2rem;
}
</style>
