// *************************************************************************************************************************
// UX
// *************************************************************************************************************************

function toggleAccordion(elem){
    var accordionElement = elem.parentElement;
    var accordionContent = accordionElement.querySelector('.item-accordion-element-content');
    var accordionIcon = accordionElement.querySelector('.item-accordion-element-icon');

    if(accordionContent.style.display == "block"){
        accordionContent.style.display = "none";
        accordionIcon.src = "assets/chevron-bottom-svgrepo-com.svg";
    }else{
        accordionContent.style.display = "block";
        accordionIcon.src = "assets/chevron-top-svgrepo-com.svg";
    }
    
    
}




// *************************************************************************************************************************
// INITIALIZATION
// *************************************************************************************************************************

function getAudioFile(record){
  var result = "";
  
  var digitalFiles = record["Digital_File_Description"];
  digitalFiles.forEach(function(digitalFile) {
      if(digitalFile["content_type"] == "Sound Recording"){
          result = digitalFile["file_url"];
      }
  });

  return result;

}

// loadJSON: loads a JSON file and returns the data as an object
async function loadJSON(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  }

async function init(){
    // get the swallow id from the URL
    const url = new URL(window.location.href);
    const swallowId = url.searchParams.get("id");
    
    const configData = await loadJSON('config.json');
    const collecionData = await loadJSON(configData.collectionURL);

    document.getElementById('header').src = configData.headerimage;
    document.getElementById('title').innerHTML = configData.title;
    
    
    const record = getRecord(collecionData,  swallowId);    
    
    // TITLE
    document.getElementById('item-main-title').innerHTML = record["Item_Description"]["title"];
    
    // CATALOGUER INFORMATION
    const cataloguer = record["cataloguer"];
    document.getElementById('item-cataloger-information').innerHTML = "Catalogued by:" + cataloguer["name"] + " "+ cataloguer["lastname"] + " on " + record["create_date"];

    // AUDIO FILE
    const audioFile = getAudioFile(record);
    if(audioFile != ""){
        var audio = document.getElementById('item-audio-player');
        audio.src = audioFile;
       // document.getElementById('item-audio-container').appendChild(audio);
    }

    // CONTENT
    const content = record["Content"];
    var contentElem = document.getElementById('item-description-template').content.cloneNode(true);
    contentElem.querySelector('.item-accordion-element').id = "content";
    contentElem.querySelector('.item-accordion-element-title-text').innerHTML = "Content";
    contentElem.querySelector('.item-accordion-element-title').setAttribute('onclick',"toggleAccordion(this)");
    contentElem.querySelector('.item-accordion-element-content').textContent =  content["contents"];
    document.getElementById('item-description-container').appendChild(contentElem);

    // DATES
    const dates = record["Dates"];
    var datesElem = document.getElementById('item-description-template').content.cloneNode(true);
    datesElem.querySelector('.item-accordion-element').id = "dates";
    datesElem.querySelector('.item-accordion-element-title-text').innerHTML = "Dates";
    datesElem.querySelector('.item-accordion-element-title').setAttribute('onclick',"toggleAccordion(this)");
    var html = "";
    dates.forEach(date => {
        html += "<p> Date: "+date["date"]+"</p>";
        html += "<p> Type: "+date["type"]+"</p>";
        html += "<p> Source: "+date["source"]+"</p>";
    });   
    datesElem.querySelector('.item-accordion-element-content').innerHTML =  html;
    document.getElementById('item-description-container').appendChild(datesElem);
    
  // CREATORS
    const creators = record["Creators"];
    var creatorsElem = document.getElementById('item-description-template').content.cloneNode(true);
    creatorsElem.querySelector('.item-accordion-element').id = "creators";
    creatorsElem.querySelector('.item-accordion-element-title-text').innerHTML = "Creators";
    creatorsElem.querySelector('.item-accordion-element-title').setAttribute('onclick',"toggleAccordion(this)");
    var html = "";
    creators.forEach(creator => {
        html += "<p> Name: "+creator["name"]+"</p>";
        var roles = "";
        creator["role"].forEach(role => {
            roles += role["value"] + ", ";
        });
        html += "<p> Roles: "+roles+"</p>";
        html += "<p> Notes: "+creator["notes"]+"</p>";
    });   
    creatorsElem.querySelector('.item-accordion-element-content').innerHTML =  html;
    document.getElementById('item-description-container').appendChild(creatorsElem);
  
  //CONTRIBUTORS
    const contributors = record["Contributors"];
    if(Array.isArray(contributors) && contributors.length > 0){
      var contributorsElem = document.getElementById('item-description-template').content.cloneNode(true);
      contributorsElem.querySelector('.item-accordion-element').id = "contributors";
      contributorsElem.querySelector('.item-accordion-element-title-text').innerHTML = "Contributors";
      contributorsElem.querySelector('.item-accordion-element-title').setAttribute('onclick',"toggleAccordion(this)");
      var html = "";
      
      contributors.forEach(contributor => {
          html += "<p> Name: "+contributor["name"]+"</p>";
          var roles = "";
          if(Array.isArray(contributor["role"])){
            contributor["role"].forEach(role => {
                roles += role["value"] + ", ";
            });
          }
          html += "<p> Roles: "+roles+"</p>";
          if(contributor["notes"] != undefined){
            html += "<p> Notes: "+contributor["notes"]+"</p>";
          }
          
      });   
      contributorsElem.querySelector('.item-accordion-element-content').innerHTML =  html;
      document.getElementById('item-description-container').appendChild(contributorsElem);
    }

    
    

}

init();