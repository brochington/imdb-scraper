/*
Fully Copy the below code into the browser console.
You should see a bright red link at the top of the browser window.
Click on it, and a download of a csv containing filmaker's data should begin.
*/

/* Start Copy */

const csv = [...document.querySelectorAll('[data-a-name="filmmakers"] tbody')].flatMap(el => {
  const section = el.querySelector('tr.a-histogram-row.a-active.heading > th:nth-child(1) > span > span > span.a-size-.a-text-bold') || el.querySelector('tr span.a-text-bold');

  if (!section) return null;
  const sectionName = section.innerText;
  
  const filmmakers = [...el.querySelectorAll('.filmmaker')].map(filmmaker => {
    const name = filmmaker.querySelector("td:nth-child(1) > div > span > span > a").innerText;
    const position = filmmaker.querySelector("td:nth-child(1) > div > div > span > span.see_more_text_collapsed").innerText;

    return {
      section: sectionName.trim(),
      name,
      position: position.replaceAll(",", "-")
    }
  })

  return filmmakers;
})
.filter(f => !!f)
.reduce((acc, { section, name, position}) => `${acc}${section},${name},${position}\n`, 'section,name,position\n');

const showName = document.querySelector('#title_heading > h1 > span > a').innerText;
const episodeInfo = document.querySelector('#title_heading > div.a-row.a-spacing-micro').innerText;

let a=document.createElement('a');
a.textContent=`click me to download ${showName}-${episodeInfo}.csv`;
a.download=`${showName}-${episodeInfo}.csv`;
a.href='data:text/csv;charset=utf-8,'+escape(csv);
a.style.position = "fixed";
a.style.zIndex = "9999";
a.style.fontSize = "48px";
a.style.color = "red";
a.style.top = "20px";
a.style.left = "20px";
a.style.lineHeight = "58px";
document.body.appendChild(a);

/* End Copy */

/*
Below is the exact same code as above, just "minified" to make copy/paste a little easier
*/

/* Start Copy */
const csv=[...document.querySelectorAll('[data-a-name="filmmakers"] tbody')].flatMap(e=>{const t=e.querySelector("tr.a-histogram-row.a-active.heading > th:nth-child(1) > span > span > span.a-size-.a-text-bold")||e.querySelector("tr span.a-text-bold");if(!t)return null;const n=t.innerText;return[...e.querySelectorAll(".filmmaker")].map(e=>{const t=e.querySelector("td:nth-child(1) > div > span > span > a").innerText,a=e.querySelector("td:nth-child(1) > div > div > span > span.see_more_text_collapsed").innerText;return{section:n.trim(),name:t,position:a.replaceAll(",","-")}})}).filter(e=>!!e).reduce((e,{section:t,name:n,position:a})=>`${e}${t},${n},${a}\n`,"section,name,position\n"),showName=document.querySelector("#title_heading > h1 > span > a").innerText,episodeInfo=document.querySelector("#title_heading > div.a-row.a-spacing-micro").innerText;let a=document.createElement("a");a.textContent=`click me to download ${showName}-${episodeInfo}.csv`,a.download=`${showName}-${episodeInfo}.csv`,a.href="data:text/csv;charset=utf-8,"+escape(csv),a.style.position="fixed",a.style.zIndex="9999",a.style.fontSize="48px",a.style.color="red",a.style.top="20px",a.style.left="20px",a.style.lineHeight="58px",document.body.appendChild(a);
/* End Copy */