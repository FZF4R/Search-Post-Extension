import axios from 'axios';

interface RequestData {
  api_key: string;
  credentials_type: string;
  email: string;
  format: string;
  generate_machine_id: string;
  generate_session_cookies: string;
  locale: string;
  method: string;
  password: string;
  return_ssl_resources: string;
  v: string;
}


const apiUrl : string = 'https://www.facebook.com/api/graphql/';
const originUrl : string = 'https://www.facebook.com'; 
const referrerUrl : string= 'https://www.facebook.com/profile.php?id=';

export const GetFB_DtsgValue = async function (): Promise<string> {
  let facebookDocument : string = await fetch('https://m.facebook.com/settings/account/?settings_tracking=mbasic_footer_link%3Asettings_2_0&refid=31', { method: 'GET', credentials: 'include' }).then(a => a.text());
  try {
    return facebookDocument.split('dtsg":{"token":"')[1].split("\"")[0]
  } catch(error) {
    console.log(error);
    return "";

  }
}

export const GetResponseByUrl = async function(url: string): Promise<string> {
  return fetch(url, { method: 'GET', credentials: 'include' }).then(a => a.text());
}

export const GetEAABToken = async function(url: string): Promise<string> {
  return fetch(url, { method: 'GET', credentials: 'include' }).then(a => a.text());
}

export const GetTokenEAABByDOM = function(rawHtml: string): string {
  let result: string = '';

  if (!rawHtml || rawHtml.trim() === '') {
      return result;
  }

  try {
      const match = rawHtml.match(/"(EAAB[^"]+)/);

      if (match && match[1]) {
          result = match[1].replace(/\\/g, '');
      }
  } catch (ex) {
      result = '';
      console.error(`Error in getTokenEAABByRawDOM: ${ex}`);
      // Handle exception (you may want to log it or perform other actions)
  }

  return result;
}

export const GetEAABTokenURL = async function(): Promise<string> {
  return fetch('https://www.facebook.com/adsmanager/manage/campaigns', { method: 'GET', credentials: 'include' }).then(a => a.text());
}

export const GetUrlTokenEAABByDocument = function(rawHtml: string): string {
  try {
      if (!rawHtml.includes('window.location.replace("') || !rawHtml.includes('");</script>')) {
          return '';
      }

      if (rawHtml.indexOf('window.location.replace("') > rawHtml.indexOf('");</script>')) {
          return '';
      }

      const startIndex = rawHtml.indexOf('window.location.replace("') + 25;
      const endIndex = rawHtml.indexOf('");</script>');
      const url = rawHtml.substring(startIndex, endIndex);
      return url.replace(/\\/g, '');
  } catch (ex) {
      console.log("GetUrlTokenEAABByDocument");
      console.log(ex);
  }

  return '';
}


export const SendQueryRequestFtech = async function (accountUID: string, keyWord: string, fb_dtsg: string, cur_sor: string, isRecentPost: boolean): Promise<any> {
  // if (!cur_sor) cur_sor = 'AbqB5qnOdOSi0FB86Phf9XJmgKokta98ONdXGthmEAgbB8HPIXOjj7h_7OkduXILlsKtpvTYVuZnFFuknqqomacLdDWqjyPTSVofFxwsWkR6ERM4vIPtsMvkuAzDmLRq4QgmjrHPSSVt-W_CUkDB_Zyb1Pywm3pcgipKFzYRlV1RtkYrgMTQgGk2kwTZI7l0kLdsuN8ULk7bAansq8TRBoCqpY5ryDy4Kp6k1V2yIxb8MYrBcOG6if6xI27A_N9uTdOmEMX6__TINu4qBB-iPr0_njk7hMgEzs2zRmBV-Jen8iBw4hdDDEeoelWm6EGqNOwKaFH9Q5y6inMF9-GiPtzoGEu3dE0smizbrAyZWAl1DpfinX3dtx8CSSZH0d1F7pWufnN5gVDjtn1VNweV_YBxFRo4-imrYPTeX1lLw5V0eRuGmW46fy0n8M8kai33GT0BHnDh_hZfywlS24ayqyOPTM0K9vYdOgIsb650zFbksxaTNZVkoMgXT7YNM_8Qay6wCggeqpJNCkabbpIfYGtA97rX_Bv4i-ouA1mnrToehuo-WDJFQ-ItkKvS-pthVrd04bHGSsPIpbzHDgyr1rFeJGW6iajT_VdNDj4Arup2gt5z0qGkEDIsb1oXMPyjUPcd4UtrSb04qXIZ45_jIdwP8RNAvafJmi5vGamS7HE9Tf0FOE0rfPbndQlPkqJXUe_IVE-4A_hBRxmicH9YwbbwHs53e0NqzBtV7dPZGwBJmWA-hGWvnUAJBm52E6ZV8kTbvxN-7gvtckY4bgWRCugEtWvf9HnAwVFt_Aody92WinXSIoh3vP7ejU2XsILjp1CsBp-K3mxqr0asV9ObrRC7BW1bZrxlhrNF8znTsFnjlBA7BcE8luyDudmSjZZD8jHVIZUmzGmUw3ZbdXD6SrN46gmxxhYvp02CEd4jj9n1crEiHQJqCk14Z-gUqcjLDvpWZxYRirjKyjUcQWVDZKzQF4_lvyPf5bfLro2QaB-kTHEMZWaxxReYRHfw94-vSglPJ2vGLOC64vVBMUuOGfCD9QEtYfg1dEiClhD41s0EofNgiuamrHNQ6Y3996WBhG9Xo7p2GEb-rbBWGL0iIGJcm6Q9W-LkOt7fbjF2hP8_ASm-EThTmCzlfbqSdlL2yk8E1lS2ZrHaCX5cujlq5a8rAGe9v8Tw0PwA3DSEwAVGfJ3NdJnu2bn8MtHyDZqmkS6XL8wjaptTTIwd1qEXrbdCrD_bpF30KO2c4Z4CKihaTndAsmHbO8Jg0ilTf8TKL-MtrVv-hD96L1DrWlvrFuRnuFe0KJ0KhM0iWimksrYfSr9rGAUWFMzHNowNvvaOtKBBf8u3YAvzJy-VP60evCfxDGz8O5WdXVP9NUKF691SjAbfQMuu-Iqr67vZMIWMpbGdX9mpvirS4iiZZZY_G4jlY6_9sqHLiriWjM9Pg0m-YAqdq0dZ-9W5EAUjgcjNWCtb5MZZrmbEIi00h7pHVUBV-PUhXXYMF918tMovR3pGdD0dCZQCeLLOyegTubAyFISHgSphqMHNQ_jEDhY9Awoa0N3UpWLGqGCulNi6_K_YxP2kpp-YdeswsR1bhQQOjPmj_oyEhU3ZyaKBq7C01F8cHKOVlmh5Mlrp77hESmqG0jGyGRRywBpmf4MzKq1UhcOxlNhgBvTx7a1hKs6hIEXVFzUq77gJX_5CZt0cfAuYZX0b_mGXLmUzNIsrHTAKSHzVWya1NEOrAZq8XS4z37svJv9zGgb-GZjELZYRSSEOog3JkEqvMnB_ys-y1UmKI4aC2dIQkHYR-OAK5-ZbuvyI22eevJGhCEmKDWlRx_ZBK8ofGjo4xmnv5FAIrjsVFAVaM2_RPKxAppAKpV7oVlvZzBnsSUOVOYA54Q8rmPnqBaX52PhZqi_dP3enqwaXCfb3RLrcShJE6ENbXo11a9Lica3Z5uH3p_xEAQrd1BeB7UIZPi_mMeHPwtk6hxJHymMLLGT6L77KifPhDelTvJyk3Sv2KrxRMUo65v6MU_kEwt6p8-CuL9At0PyvKy2dXDo_vXTN9e_3pwaQmFteK1vWKIOtoVxAQ2NNG0Uw8fK0qHsgNUN5rSsPBmQC34icOqd_8hrpSj79njlP8QbxVUVZPk9t5i4CPMfs9hgACy5zEdgntz8_lYPI8QMYWyQokmN-MIjx7ywohXB-R4OQWyDDxjLEGXLIxppxIkwoDSOjQj1vlDWF_xdjzgb-dYFs6PSkL2nEjDHxWYj1JhLwQ7tYS9iI5recpK1vjAgyJTkXjio8GF78OQ32Bbdv3c5nlyMRq6L7OJHtoevdCAGqXsJoFkYK4v83G_dVdWofXh0G7WoCgfKvIUDIPHS12Xk_4dId6w7OEWAISLLLIIBu0uVEx2HRTWaCGB4BCNlmv_QCNw';

  let headers = new Headers({
    'accept': '*/*',
    'accept-language': 'en,vi;q=0.9,en-US;q=0.8',
    'content-type': 'application/x-www-form-urlencoded',
    'dpr': '1',
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-full-version-list': '"Google Chrome";v="119.0.6045.160", "Chromium";v="119.0.6045.160", "Not?A_Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"10.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'viewport-width': '1920',
  });
  const searchkeyword = keyWord;  

  var body = `angebotsart=1&page=1&size=50&pav=false&facetten=veroeffentlichtseit,arbeitszeit,arbeitsort`;

  let response = await fetch('https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v6/jobs?', {
    method: 'POST',
    headers: headers,
    body: body,
  });
  let responseData = await response.text();
    // .then(response => response.json())
    // .then(data => {
    // })
    // .catch(error => {
    //   console.log(error);
    // });
  let responseJson = {};
  try {
    return JSON.parse(responseData.split('\n')[0]);
  } catch(error) {
    console.log("Response API không hợp lệ");
    console.log(error);
    return {};
  }
}

export const SendRequestFtech = async function (accountUID: string, uidFriend: string): Promise<any> {
  let headers = new Headers({
    'accept': '*/*',
    'accept-language': 'en,vi;q=0.9,en-US;q=0.8',
    'content-type': 'application/x-www-form-urlencoded',
    'dpr': '1',
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-full-version-list': '"Google Chrome";v="119.0.6045.160", "Chromium";v="119.0.6045.160", "Not?A_Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"10.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'viewport-width': '1920',
    'x-asbd-id': '129477',
    'x-fb-friendly-name': 'FriendingCometFriendRequestSendMutation',
    'x-fb-lsd': 'bwSIoj7JJ8zhleLSIUbB-2',
    'Referer': referrerUrl + uidFriend,
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  
  const body = `av=${accountUID}&__user=${accountUID}&__a=1&__req=11&__hs=19688.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010038425&__s=xw5a7z%3Aou4453%3A4kk9mt&__hsi=7306193698413657432&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUKbgS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjHDw&__csr=geG48AJOjMHieyOR7nbtmAL9sTIG4nllh3R9OvF5dHLJuO9qGyFpGCnhHlaR-uKQuitdKeBBCyUGiVaDJ5h7CCKQulap3t4AybABy9HCgtzBHJCx7xl7V8DgKdzF-azejGu4Emz-WUCFUCQiq2S8xjwzxGdwLobeeByUvLwMxGim1swPwIz98Ku6E729x-mqEiyojwXxm68S2216wWCwFw-wbe2qUgxacwhqyFoa842axi3Gbw9SbzE7u0WE-0rSE1l4Lg1hk4U5O0aLw4twOwiV81-E0hew0-Fw0c_i08Qw9i0fow61wiaAwcS0i10po0GC0Go0q0w3Kk06cU0kSw1fm0eqwbi04O808K82xw1nZ06gwfG04sC08ww&__comet_req=15&fb_dtsg=NAcMgoA0peUQXG0tuNvzaMGJbJ__f7Cart5XGJNiL3y_g0npoSfA9eg%3A7%3A1696435316&jazoest=25517&lsd=bwSIoj7JJ8zhleLSIUbB-2&__aaid=0&__spin_r=1010038425&__spin_b=trunk&__spin_t=1701105781&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1701105780252%2C129151%2C190055527696468%2C%2C%22%2C%22friend_requestee_ids%22%3A%5B%22${uidFriend}%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%5D%2C%22actor_id%22%3A%22${accountUID}%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129`;
  
  fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: body,
  })
    .then(response => response.json())
    .then(data => {
    })
    .catch(error => {
      console.log(error);
    });
}

export const SendRequestAxios = async function (accountUID: string, uidFriend: string): Promise<any> {
  let headers : any = {
    'accept': '*/*',
    'accept-language': 'en,vi;q=0.9,en-US;q=0.8',
    'content-type': 'application/x-www-form-urlencoded',
    'dpr': '1',
    'sec-ch-prefers-color-scheme': 'light',
    'sec-ch-ua': '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'sec-ch-ua-full-version-list': '"Google Chrome";v="119.0.6045.160", "Chromium";v="119.0.6045.160", "Not?A_Brand";v="24.0.0.0"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-model': '""',
    'sec-ch-ua-platform': '"Windows"',
    'sec-ch-ua-platform-version': '"10.0.0"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'viewport-width': '1920',
    'x-asbd-id': '129477',
    'x-fb-friendly-name': 'FriendingCometFriendRequestSendMutation',
    'x-fb-lsd': 'bwSIoj7JJ8zhleLSIUbB-2',
    'Referer': referrerUrl + uidFriend,
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    // Thêm các header khác nếu cần
  };
  
  const body = `av=${accountUID}&__user=${accountUID}&__a=1&__req=11&__hs=19688.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010038425&__s=xw5a7z%3Aou4453%3A4kk9mt&__hsi=7306193698413657432&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUKbgS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjHDw&__csr=geG48AJOjMHieyOR7nbtmAL9sTIG4nllh3R9OvF5dHLJuO9qGyFpGCnhHlaR-uKQuitdKeBBCyUGiVaDJ5h7CCKQulap3t4AybABy9HCgtzBHJCx7xl7V8DgKdzF-azejGu4Emz-WUCFUCQiq2S8xjwzxGdwLobeeByUvLwMxGim1swPwIz98Ku6E729x-mqEiyojwXxm68S2216wWCwFw-wbe2qUgxacwhqyFoa842axi3Gbw9SbzE7u0WE-0rSE1l4Lg1hk4U5O0aLw4twOwiV81-E0hew0-Fw0c_i08Qw9i0fow61wiaAwcS0i10po0GC0Go0q0w3Kk06cU0kSw1fm0eqwbi04O808K82xw1nZ06gwfG04sC08ww&__comet_req=15&fb_dtsg=NAcMgoA0peUQXG0tuNvzaMGJbJ__f7Cart5XGJNiL3y_g0npoSfA9eg%3A7%3A1696435316&jazoest=25517&lsd=bwSIoj7JJ8zhleLSIUbB-2&__aaid=0&__spin_r=1010038425&__spin_b=trunk&__spin_t=1701105781&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1701105780252%2C129151%2C190055527696468%2C%2C%22%2C%22friend_requestee_ids%22%3A%5B%22${uidFriend}%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%5D%2C%22actor_id%22%3A%22${accountUID}%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129`;
  
  axios.post(apiUrl, body, { headers })
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log(error);
    });
}

export  const GetRequestFtechUnFriendScript = function (accountUID: string, uidFriend: string, fb_dtsg: string): string{
  return `fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,vi;q=0.9,en-US;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      "dpr": "1",
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua": "Google Chrome;v=119, Chromium;v=119, Not?A_Brand;v=24",
      "sec-ch-ua-full-version-list": "Google Chrome;v=119.0.6045.160, Chromium;v=119.0.6045.160, Not?A_Brand;v=24.0.0.0",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": "",
      "sec-ch-ua-platform": "Windows",
      "sec-ch-ua-platform-version": "10.0.0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "viewport-width": "1920",
      "x-asbd-id": "129477",
      "x-fb-friendly-name": "SearchCometResultsInitialResultsQuery",
      "x-fb-lsd": "erISI3IVA6pKJ7A_je2bdY"
    },
    "referrer": "https://www.facebook.com/profile.php?id=${uidFriend}",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "av=${accountUID}&__user=${accountUID}&fb_dtsg=${fb_dtsg}&jazoest=25279&lsd=erISI3IVA6pKJ7A_je2bdY&__aaid=0&__spin_r=1010119952&__spin_b=trunk&__spin_t=1701344335&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometUnfriendMutation&variables=%7B%22input%22%3A%7B%22source%22%3A%22bd_profile_button%22%2C%22unfriended_user_id%22%3A%22${uidFriend}%22%2C%22actor_id%22%3A%22${accountUID}%22%2C%22client_mutation_id%22%3A%221%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=8752443744796374",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });`
}

export  const GetRequestFtechScript = function (accountUID: string, uidFriend: string, fb_dtsg: string): string{
  return `fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,vi;q=0.9,en-US;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      "dpr": "1",
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua": "Google Chrome;v=119, Chromium;v=119, Not?A_Brand;v=24",
      "sec-ch-ua-full-version-list": "Google Chrome;v=119.0.6045.160, Chromium;v=119.0.6045.160, Not?A_Brand;v=24.0.0.0",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": "",
      "sec-ch-ua-platform": "Windows",
      "sec-ch-ua-platform-version": "10.0.0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "viewport-width": "1438",
      "x-asbd-id": "129477",
      "x-fb-friendly-name": "FriendingCometFriendRequestSendMutation",
      "x-fb-lsd": "F7ViLrd-CPZb8DyCsBHKFU"
    },
    "referrer": "https://www.facebook.com/profile.php?id=${uidFriend}",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "av=${accountUID}&__user=${accountUID}&fb_dtsg=${fb_dtsg}&jazoest=25770&lsd=F7ViLrd-CPZb8DyCsBHKFU&__aaid=0&__spin_r=1010118267&__spin_b=trunk&__spin_t=1701331598&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1701331595820%2C792841%2C190055527696468%2C%2C%22%2C%22friend_requestee_ids%22%3A%5B%22${uidFriend}%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%5D%2C%22actor_id%22%3A%22${accountUID}%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129",
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });`
}

async function SendRequest2(accountUID: string, uidFriend: string): Promise<any> {
  return fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,vi;q=0.9,en-US;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      "dpr": "1",
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
      "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"119.0.6045.160\", \"Chromium\";v=\"119.0.6045.160\", \"Not?A_Brand\";v=\"24.0.0.0\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": "\"\"",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-ch-ua-platform-version": "\"10.0.0\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "viewport-width": "1920",
      "x-asbd-id": "129477",
      "x-fb-friendly-name": "FriendingCometFriendRequestSendMutation",
      "x-fb-lsd": "vfDaQTHzC-cxga5OcKbEpf"
    },
    "referrer": `https://www.facebook.com/profile.php?id=${uidFriend}`,
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": `av=${accountUID}&__user=${accountUID}&__a=1&__req=1h&__hs=19688.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010036951&__s=6mkth5%3Alunmiz%3Aejwwny&__hsi=7306074434773014106&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUngS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjHDw&__csr=g9k4RFiHkytsBl4kBl9QOOQxGLlXiiOdPuOEhimBhcJ9_nWhiGK_RX8BGkGm9DWCJkGtyqBhV9QQieBBCyUGhaQGAJeFqAWKXy9kAl3tpUyQV4fKp1SemKSq45xl7V8DgKdzF-5-jGu4HxaULKKcDyrh9EhwAxjxG8xG3TwIUWmbx--326F86a3e2OcAG8Dzo7S9z8iBCG4EC4UeUlxydwwwhe3Gq2C3W0IU9Hx24EO15G48a842awjUK0GoW1TweGfw6ZG0lhbQ0kl1e1sw2HU17ocE4Ki06io0fGo03fQw2d82kw3S81wo4yF83dw4wg6m0aFwaC06w80XB01ze05dE0jRw3CE2Qw0S1wa605vQ0p20-E0hOo&__comet_req=15&fb_dtsg=NAcMQiAZMmoKGrIQwG0QPDEeL522Wuwo-A-1PT4r0viBKYGhFmj2YoA%3A7%3A1696435316&jazoest=25176&lsd=vfDaQTHzC-cxga5OcKbEpf&__aaid=0&__spin_r=1010036951&__spin_b=trunk&__spin_t=1701078013&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1701078012425%2C353382%2C190055527696468%2C%2C%22%2C%22friend_requestee_ids%22%3A%5B%22${uidFriend}%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%5D%2C%22actor_id%22%3A%22${accountUID}%22%2C%22client_mutation_id%22%3A%223%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
  });
}

async function SendRequest(accountUID: string, uidFriend: string): Promise<any> {
  return fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en,vi;q=0.9,en-US;q=0.8",
      "content-type": "application/x-www-form-urlencoded",
      "dpr": "1",
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
      "sec-ch-ua-full-version-list": "\"Google Chrome\";v=\"119.0.6045.160\", \"Chromium\";v=\"119.0.6045.160\", \"Not?A_Brand\";v=\"24.0.0.0\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-model": "\"\"",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-ch-ua-platform-version": "\"10.0.0\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "viewport-width": "1920",
      "x-asbd-id": "129477",
      "x-fb-friendly-name": "FriendingCometFriendRequestSendMutation",
      "x-fb-lsd": "j7B_jRfXw9wpdOcpKVwpXR",
      "Referer": "https://www.facebook.com/profile.php?id=" + uidFriend,
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": `av=${accountUID}&__user=${accountUID}&__a=1&__req=y&__hs=19688.HYP%3Acomet_pkg.2.1..2.1&dpr=1&__ccg=EXCELLENT&__rev=1010036951&__s=i0h8fz%3Amte1cp%3Avguylp&__hsi=7306092580952747218&__dyn=7AzHK4HzE4e5Q1ryaxG4VuC2-m1xDwAxu13wFwhUKbgS3q5UObwNwnof8boG0x8bo6u3y4o2Gwn82nwb-q7oc81xoswIK1Rwwwqo465o-cwfG12wOx62G5Usw9m1YwBgK7o884y0Mo4G1hx-3m1mzXw8W58jwGzE8FU5e7oqBwJK2W5olwUwgojUlDw-wUwxwjFovUy2a0SEuBwFKq2-azqwqo4i223908O3216xi4UdUcojxK2B0oobo8oC1hxB0qo4e16wWwjHDw&__csr=geG48AJOjMHieyOR7nbtmAIRPuOEhtll4fkD9-AkSKmRX8BGGaBCGvQqRiJvDHJ7ADjrzFppEKaAiAGuQZ4iCCKUylap3tqAybjBy9HCgtzBHJCx7xl7V9_gKdzF-azejGu4EmKbXHyqDyrh9Eboy5e2e6ES2ZwIUWmbx--326F9o5O3e2OcAyVUqws8C7VpGxa9xe3K5oozo884q3Gq2C3W0IU9Hx24EO15GaBwEwg8G58eEK0DoKewtU3GzU1Lqw5kiZ055gjwn80G-0hS3a1bAw7Ww14W03WC00PZ80zi0B80Zy0o618Gi0Po1841Bw2Go2Fw1E20eVg0oPw1jq04Zo0VG0J80j8w0yUwa605vQ0p20-E0hOo0y2&__comet_req=15&fb_dtsg=NAcMRujz9KSgA01MY86tVPUQQDAygNk4-3QhqI_aO8h8dQBHquSn-dA%3A7%3A1696435316&jazoest=25226&lsd=j7B_jRfXw9wpdOcpKVwpXR&__aaid=0&__spin_r=1010036951&__spin_b=trunk&__spin_t=1701082238&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=FriendingCometFriendRequestSendMutation&variables=%7B%22input%22%3A%7B%22attribution_id_v2%22%3A%22ProfileCometTimelineListViewRoot.react%2Ccomet.profile.timeline.list%2Cvia_cold_start%2C1701082238134%2C580522%2C190055527696468%2C%2C%22%2C%22friend_requestee_ids%22%3A%5B%22${uidFriend}%22%5D%2C%22refs%22%3A%5Bnull%5D%2C%22source%22%3A%22profile_button%22%2C%22warn_ack_for_ids%22%3A%5B%5D%2C%22actor_id%22%3A%22${accountUID}%22%2C%22client_mutation_id%22%3A%222%22%7D%2C%22scale%22%3A1%7D&server_timestamps=true&doc_id=7033797416660129`,
    "method": "POST"
  });
}

export const addFriendAccount = async function (accountUID: string, friendUID: string) {
  let response: any = {};
  try {
      response = await SendRequest(accountUID, friendUID);
  } catch (error) {
    response.error_code = 100000;
    response.error_message = error;
    console.log(error);
  }

  return response;
}

const TryParseResponse = function(str: string) : any {
  let response : any = null;
  try {
    response = JSON.parse(str);
  } catch (error) {
    console.log("TryParseResponse ==>");
    console.log(error);
  }
  return response;
}

export const GetAllFriendByToken = async function (token: string): Promise<any> {
  let response: any = {};
  let friends = [];
  try {
    let pagingFriendUrl : string = `https://graph.facebook.com/v11.0/me/friends?fields=id,name&access_token=${token}`
    let responseString = await GetResponseByUrl(pagingFriendUrl);
    response = TryParseResponse(responseString);
    try {
      friends.push(response["data"]);
      while (response && IsValidNextPage(response)){
        pagingFriendUrl = `https://graph.facebook.com/v11.0/me/friends?fields=id,name&access_token=${token}&after=${GetNextPageCursor(response)}`;
        responseString = await GetResponseByUrl(pagingFriendUrl);
        response = TryParseResponse(responseString);
        if (response && response["data"]) friends.push(response["data"]);
      }
      return friends;
    } catch (err) {  }

  } catch (error) {
    console.log("GetAllFriendByToken ==> ");
    console.log(error);
  }

  return friends;
}

const IsValidNextPage = function (resFriendPaging: any): boolean {
  if (!resFriendPaging) {
      return false;
  }
  try {
      if (!resFriendPaging["paging"] || !resFriendPaging["paging"]["next"] || ((resFriendPaging["paging"]["next"] as any)?.toString()?.length === 0)) {
          return false;
      }

      if (!resFriendPaging["paging"]["cursors"] || !resFriendPaging["paging"]["cursors"]["after"] || ((resFriendPaging["paging"]["cursors"]["after"] as any)?.toString()?.length === 0)) {
          return false;
      }
  } catch (ex) {
      return false;
  }

  return true;
}

const GetNextPageCursor = function (resFriendPaging: any): string {
  if (IsValidNextPage(resFriendPaging)) return (resFriendPaging["paging"]["cursors"]["after"]).toString();
  return "";
}

export const GetScriptByModel = function(scriptModel: string): string{
  switch (scriptModel) {
    case "ADD MAIL":
      return `var email = '##email##';
var uid = '##uid##';
var fb_dtsg = '##fb_dtsg##';
fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "Not_A Brand;v=99, Google Chrome;v=109, Chromium;v=109",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "viewport-width": "1612",
        "x-fb-friendly-name": "useCometAccountSettingsRemoveEmailMutation",
    },
    "referrer": "https://www.facebook.com/settings?tab=security",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": \`av=\${uid}&__user=\${uid}&fb_dtsg=\${fb_dtsg}&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=useCometAccountSettingsRemoveEmailMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%225%22%2C%22actor_id%22%3A%22\${uid}%22%2C%22contact_point%22%3A%22\${email}%22%7D%7D&server_timestamps=true&doc_id=7776513789086495&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D30605361%22%5D\`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
}).then(res => console.log(res.text()));`


    case "Xóa SĐT":
    return `var emailXoa = '##email##';
var uid = '##uid##';
var fb_dtsg = '##fb_dtsg##';
fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "Not_A Brand;v=99, Google Chrome;v=109, Chromium;v=109",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "viewport-width": "1612",
        "x-fb-friendly-name": "useCometAccountSettingsRemoveEmailMutation",
    },
    "referrer": "https://www.facebook.com/settings?tab=security",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": \`av=\${uid}&__user=\${uid}&fb_dtsg=\${fb_dtsg}&fb_api_req_friendly_name=useCometAccountSettingsRemoveEmailMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%225%22%2C%22actor_id%22%3A%22\${uid}%22%2C%22contact_point%22%3A%22\${emailXoa}%22%7D%7D&server_timestamps=true&doc_id=7776513789086495&fb_api_analytics_tags=%5B%22qpl_active_flow_ids%3D30605361%22%5D\`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
}).then(res => console.log(res.text()));`


    case "CHANGE PASS":
    return `var newPass = "##email##";
var uid = '##uid##';
var fb_dtsg = '##fb_dtsg##';
fetch("https://www.facebook.com/api/graphql/", {
    "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-prefers-color-scheme": "dark",
        "sec-ch-ua": "Google Chrome;v=113, Chromium;v=113, Not-A.Brand;v=24",
        "sec-ch-ua-full-version-list": "Google Chrome;v=113.0.5672.127, Chromium;v=113.0.5672.127, Not-A.Brand;v=24.0.0.0",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "Windows",
        "sec-ch-ua-platform-version": "10.0.0",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "viewport-width": "1746",
        "x-asbd-id": "129477",
        "x-fb-friendly-name": "IDReviewDisavowCheckpointSecureAccountUpdatePasswordMutation",
    },
    "referrer": "https://www.facebook.com/checkpoint/322333145742201/?next=https%3A%2F%2Fwww.facebook.com%2F&wtsid=rdr_0uegWfsW6f7FbNsg9",
    "referrerPolicy": "origin-when-cross-origin",
    "body": \`av=\${uid}&__user=\${uid}&fb_dtsg=\${fb_dtsg}&fb_api_req_friendly_name=IDReviewDisavowCheckpointSecureAccountUpdatePasswordMutation&variables=%7B%22input%22%3A%7B%22client_mutation_id%22%3A%222%22%2C%22actor_id%22%3A%22\${uid}%22%2C%22new_password%22%3A%7B%22sensitive_string_value%22%3A%22\${newPass}%22%7D%7D%7D&server_timestamps=true&doc_id=5002328586488373\`,
    "method": "POST",
    "mode": "cors",
    "credentials": "include"
}).then(r => r.text());`
      
    default:
      return "console.log(##email##)";
  }
}

export default {
  addFriendAccount,
  SendRequestAxios,
  SendRequestFtech,
  GetRequestFtechScript,
  GetFB_DtsgValue,
  GetRequestFtechUnFriendScript,
  GetEAABToken,
  GetUrlTokenEAABByDocument,
  GetTokenEAABByDOM,
  GetEAABTokenURL,
  GetResponseByUrl,
  GetAllFriendByToken,
  GetScriptByModel
};
