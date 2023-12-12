// *************************************************************************************************************************
// SHOW CARDS
// *************************************************************************************************************************
function search(){
    var searchValue = document.getElementById('search-box').value;
    if(searchValue == ""){
        selectAll();
    }else{
        var result = serachOnDataset(collecionData,  searchValue);
        currentSelection = result;  
    } 
    currentSelection = sortByField(currentSelection, "Item_Description/title");   
    displayCards();
}

function getImageURL(record){
    var result = "assets/images/nia.jpg";
    if(record['Item_Description']['image'] !== undefined){
        result = record['Item_Description']['image'];
    }else{
        if(record['Item_Description']['image_url'] !== undefined){
            result = record['Item_Description']['image_url'];
        }else{
            //Digital_File_Description
            var digitalFileDescription = record['Digital_File_Description'];
            digitalFileDescription.forEach(function(digitalFile) {
                if(digitalFile['content_type'] == 'Photograph'){
                    const filename = digitalFile['filename'];
                    //check if the filename contains the string "front"
                    if( filename !== undefined &&  filename.includes("front")){
                        result = "./assets/images/"+digitalFile['filename'];
                    }
                    //result = "./assets/images/"+digitalFile['filename'];
                }
            });
        }
    }
    
    return result;
}

async function displayCards() {


    document.getElementById('record-list').innerHTML = "";
    currentSelection.forEach(function(record) {
        // clone the card template, populate it with data, and append it to the DOM record-list element
        const card = document.getElementById('card-template').content.cloneNode(true);
        //set the id of the card to the id of the record
        card.querySelector('.card').setAttribute('id',record['swallow_id']);      
        card.querySelector('.card-title').innerHTML = record['Item_Description']['title'];
     //   card.querySelector('.card-text').innerHTML = record['Content']['notes'];
        card.querySelector('.card-img-top').src = getImageURL(record);
        card.querySelector('.card-button').setAttribute('onclick','showItem('+record['swallow_id']+')');
        document.getElementById('record-list').appendChild(card);
    }); 
}

 

function showItem(id){
    window.location.href = "item.html?id="+id;
}  

// *************************************************************************************************************************
// FACETS
// *************************************************************************************************************************

function extractFieldValue(fieldArray){
    var result = [];
    if(Array.isArray(fieldArray)){
        //is a multiple field
        fieldArray.forEach(function(fieldData) {
            if(fieldData['value'] !== undefined){
                result.push(fieldData['value']);
            }
            
        });

    }else{
        
        result.push(fieldArray);
    }
    return result;
}

function extractFacetValues(dataset, path){
    var result = [];
    dataset.forEach(function(record) {
        var indexArray = path.split("/");
        step = record[indexArray[0]];
        if(Array.isArray(step)) {
            //is a multiple step
            step.forEach(function(stepData) {
                if(stepData[indexArray[1]] != undefined){
                    result.push(extractFieldValue(stepData[indexArray[1]]));
                }
            });
        }else{
            //is a single step       
            if(indexArray[1] != undefined) {
                result.push( extractFieldValue( step[indexArray[1]] ) ) ;
            }         
        }  
    });
    //flatten the array
    result = result.flat();
    //remove duplicates
    result = [...new Set(result)];    
    //sort the array
    result.sort();
    return result;
}

function createFacets(){
    var pointer = 0;
    indexes.forEach(function(index) {
        if(index["filter"] == "yes"){
            var facetValues = extractFacetValues(collecionData, index.path);
            var uniqueFacetValues = [...new Set(facetValues)];


            var facet = document.getElementById('facet-template').content.cloneNode(true);
            facet.querySelector('.facet-title').innerHTML = index.label;
            var select = facet.querySelector('.facet-select');
            select.setAttribute('onchange',"filterRecords(this, '"+pointer+"')");
            uniqueFacetValues.forEach(function(value) {
                var option = document.createElement("option");
                option.text = value;
                select.appendChild(option);
            });
            document.getElementById('facets-list').appendChild(facet);
        }
        pointer++;
    });
}

function filterRecords(facetElement, index){
    if(facetElement.value == "any"){
        selectAll();
    }else{
        var result = filterdataset(collecionData, indexes[index], facetElement.value);
        currentSelection = result;
    }
    
    currentSelection = sortByField(currentSelection, "Item_Description/title");
    displayCards();
    
}

// *************************************************************************************************************************
// INITIALIZATION
// *************************************************************************************************************************

// loadJSON: loads a JSON file and returns the data as an object
async function loadJSON(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// loadConfig: loads the config.json file 
async function loadConfig() {
    const configData = await loadJSON('config.json');
    document.getElementById('pagetitle').innerHTML = configData.title;
    document.getElementById('header').src = configData.headerimage;
    document.getElementById('title').innerHTML = configData.title;
    document.getElementById('description').innerHTML = configData.description;
    collecionData = await loadJSON(configData.collectionURL);
    indexes = configData.indexes;
    selectAll();
    displayCards();
    createFacets();
}

loadConfig();
