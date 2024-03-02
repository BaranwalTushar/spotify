console.log("write some java script")

let songs;
let currentSong = new Audio();
let currFolder;

//Time duration function
function secondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Adding leading zero if necessary
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

// Example usage:
const totalSeconds = 125;
const formattedTime = secondsToMinutes(totalSeconds);
console.log(formattedTime); // Output: "02:05"


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`)

    let response = await a.text();
    console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
     songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }
    //show all the song list
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Arijit Singh</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="img/playbar.svg" alt="">
                        </div> </li>`;

    }


    // Attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {

        e.addEventListener("click", element => {

            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })

    })
    return songs
   
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/spotify/songs/" + track)
    currentSong.src = `/${currFolder}/` + track

    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

    
}

async function displayAlbum(){
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        if(e.href.includes("/songs")&& !e.href.includes(".htaccess")){
            let folder = (e.href.split("/").splice(-2)[0])

            //Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
           
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card ">
            <div class="play">


                <svg xmlns="http://www.w3.org/2000/svg" width="70%" height="70%" viewBox="0 0 24 24"
                    fill="none" style="fill: black;">
                    <path
                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                        stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>


            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>

        </div>`

        }
    }
     //Load the playlist whenever the card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click",async item=>{
            console.log(item,item.currentTarget.dataset)
            songs = await getSongs(`songs/${ item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
           
        })
    })
}

async function main() {


    //get the  list of all song
      await getSongs("songs/ncs")
      

    playMusic(songs[0], true)
   
    // Display all the album on the pages

     await displayAlbum()
    
    //Attach a event listener to play previous next 

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/playbar.svg"
        }
    })

    //listen for time update event

    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutes(currentSong.currentTime)}
         ${secondsToMinutes(currentSong.duration)}  `


        //seek bar movement
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })
    //Add an eventlistener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //Add an evenlistener for hamburger

    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })
     
    //Add an evenlistener for Close button

    document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%"
    })

    //Add an eventlistener for previous and next
    previous.addEventListener("click",()=>{
        
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if((index-1)>=0){
            playMusic(songs[index-1])
        }
    })

    next.addEventListener("click", ()=>{
      
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if((index+1)<songs.length){
            playMusic(songs[index+1])
        }
    })

    //Add an event for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change" , (e)=>{
      
        currentSong.volume = parseInt(e.target.value)/100;
        // if(currentSong.volume>0){
        //     document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        // }
    }) 

    //add an event to mute
    document.querySelector(".volume>img").addEventListener("click",e=>{
     if(e.target.src.includes("volume.svg")){
       e.target.src =  e.target.src.replace("volume.svg","mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
     }
     else{
       e.target.src = e.target.src.replace("mute.svg","volume.svg")
       currentSong.volume = .10;
       document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
       
     }
    })

   
}
main()



