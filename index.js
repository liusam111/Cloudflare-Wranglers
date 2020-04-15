addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

//Returns 0 or 1
function getRandomIndex(){
  return Math.floor(Math.random() * 2);
}


//Cookie format is "name=value; MaxValue=value"
function getCookie(request, name){
  let result = null;
  let cookieString = request.headers.get("Cookie");
  
  if(cookieString){
    let cookies = cookieString.split(";");
    for(let i = 0; i < cookies.length; i++){
      let cookieName = cookies[i].split("=")[0].trim();
      if(cookieName == name){
        result = cookies[i].split("=")[1];
      }
    }
  }

  return result;

}

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {

    try{

      let htmlRewriters= new Array(2);

      //0: Heads
      htmlRewriters[0] = new HTMLRewriter() 
        .on("title", {element: e => e.setInnerContent("Coin Flipper: Heads")})
        .on("h1#title", {element: e => e.setInnerContent("Heads!")})
        .on("p#description", {element: e => e.setInnerContent("Congrats! You got a heads! You get...")})
        .on("a#url", {element: e => e.setInnerContent("The Best Link on the Internet!")})
        .on("a#url", {element: e => e.setAttribute("href", "https://www.youtube.com/watch?v=dQw4w9WgXcQ")});

      //1: Tails
      htmlRewriters[1] = new HTMLRewriter() 
        .on("title", {element: e => e.setInnerContent("Coin Flipper: Tails")})
        .on("h1#title", {element: e => e.setInnerContent("Tails!")})
        .on("p#description", {element: e => e.setInnerContent("Wow! You got a tails! You get...")})
        .on("a#url", {element: e => e.setInnerContent("A Professional Link!")})
        .on("a#url", {element: e => e.setAttribute("href", "https://github.com/liusam111")})


      
      let response = await fetch("https://cfw-takehome.developers.workers.dev/api/variants");
      let data = await response.json();


      let cookie = getCookie(request, "prevPage"); //Cookie is either 0 or 1
      cookie = cookie === null ? getRandomIndex() : cookie;


      let url = data.variants[cookie];
      let newResponse = await fetch(url);
      newResponse = new Response(newResponse.body, newResponse);

      //Sets cookie if it doesn't exist, refresh duration if it does
      newResponse.headers.set("Set-Cookie", `prevPage=${cookie}; Max-Age=2147483647`);

      return htmlRewriters[cookie].transform(newResponse);
      

    } catch(err){
      console.log(`Error Fetching: ${err}`);
    }

}


