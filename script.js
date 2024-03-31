const corsAnywhereURL = "https://cors-anywhere.herokuapp.com/";
// Needs visit to https://cors-anywhere.herokuapp.com/corsdemo and
// click on "Request temporary access to the demo server" using
// same browser as used to load page running this javascript code.
// After that's done the CORS policy error gets resolved!
const forbiddenErrorMsg = `<p>Got 'Forbidden (403)' response.</p>
<p> You may need to visit <a href="https://cors-anywhere.herokuapp.com/corsdemo"
  >https://cors-anywhere.herokuapp.com/corsdemo</a> and click on 
  "Request temporary access to the demo server".</p><p> Then load this page again.</p>`;

const mainElm = document.getElementById("main");
const blogProtocolHostnameElm = document.getElementById(
  "blog-protocol-hostname"
);

const numPostsElm = document.getElementById("num-posts");
const fullBlogFeedURLElm = document.getElementById("full-blog-feed-url");
const formEl = document.getElementById("form");
const showBlogBookBtn = document.getElementById("show-blog-book");
const fetchGetURLElm = document.getElementById("fetch-get-url");
const formAlertElm = document.getElementById("form-alert");

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  formAlertElm.innerHTML = "";
  let numPosts = numPostsElm.value;
  if (numPosts === "") numPosts = 1;
  let feedReqURL = corsAnywhereURL;
  if (fullBlogFeedURLElm.value != "") {
    feedReqURL += fullBlogFeedURLElm.value;
  } else {
    feedReqURL +=
      blogProtocolHostnameElm.value +
      "feeds/posts/default/" +
      "?max-results=" +
      numPosts +
      "&alt=json";
  }
  fetchGetURLElm.innerHTML = feedReqURL;
  const options = {
    method: "GET",
    muteHttpExceptions: true,
  };
  console.log(feedReqURL);
  try {
    response = await fetch(feedReqURL, options);
    console.log("response");
    console.log(response);
    if (!response.ok) {
      if (response.status === 403) {
        formAlertElm.innerHTML = forbiddenErrorMsg;
      } else {
        formAlertElm.innerHTML = `Fetch request failed. .. status: ${response.status} ,
        status text: ${response.statusText} `;
      }
      return;
    }
    let data = await response.json();
    console.log("data");
    console.log(data);
    let contentHTML = "";
    contentHTML += `<h2>Posts returned by fetch GET URL: ${feedReqURL}</h2>`;
    const now = new Date();
    contentHTML += `<p><br/>on ${now.toString()}<br/><br/><br/><hr/><hr/><hr/></p>`;
    for (i in data.feed.entry) {
      contentHTML +=
        "<h1>" +
        data.feed.entry[i].title.$t +
        "</h1>" +
        data.feed.entry[i].content.$t +
        "<hr />" +
        "<hr />";
    }

    // Why is below SetTimeout needed?
    // From https://developer.mozilla.org/en-US/docs/Web/API/Window/open :
    // "Remote URLs won't load immediately. When window.open() returns, the window always contains about:blank.
    // The actual fetching of the URL is deferred and starts after the current script block finishes executing.
    // The window creation and the loading of the referenced resource are done asynchronously."
    // Without SetTimeout it seems that the body of the new document is not yet setup when the
    // body's innerHTML is assigned the value below. So when the new window opens it shows only the static
    // contents of blogbook.html! Having a timeout results in the body of the new document set up correctly
    // and so below code value assignment to body works as expected.
    const newWindow = window.open("blogbook.html");
    setTimeout(function () {
      newWindow.document.body.innerHTML =
        '<main id="main">' + contentHTML + "</main>";
    }, 1000); // Delay of 1 second works
    // }, 0); // Delay of 0 seconds does not work

    // There is an interesting possibility of opening the blogbook window immediately after we get the data
    // from fetch and then add to the contents of the blogbook post by post instead of doing it all at once.
    // But that is more programming work and I am not ready now to spend time on that.
  } catch (error) {
    formAlertElm.innerHTML = error;
    console.log("error");
    console.log(error);
  }
});