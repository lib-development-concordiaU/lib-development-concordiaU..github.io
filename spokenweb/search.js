// define global variable collecion data
let collecionData;
let indexes;
let currentSelection;

// *************************************************************************************************************************
// SEARCH FUNCTIONALITY
// *************************************************************************************************************************

function findInField(fieldData, value) {
    var result = false;
    if(fieldData !== undefined){
        //lowercase the field data and the value        
        fieldData = fieldData.toLowerCase();
        value = value.toLowerCase();
        if(fieldData.includes(value)) {
            result = true;
        }
    }
    
    return result;
}

function findInStep(stepData, indexArray, value) {
    var result = false;
    var found = false
     if ( Array.isArray(stepData[indexArray[1]]) ) {
        //is a multiple field
        
        fieldArray = stepData[indexArray[1]];
        fieldArray.forEach(function(singleField) {
          //  console.log(singleField['value']);
            found = findInField(singleField['value'], value);
            if(found){
                result = found;
            }
        });
    }else{
        //is a single field -> lets check if the value is a substring of the field
        found = findInField(stepData[indexArray[1]], value);
        if(found){
            result = found;
        }     
    }   
    return result;
}

function findInRecord(dataset,index, value) {
    result = false;
    
    //split the index string into an array unsing "/" as the delimiter
    var indexArray = index.path.split("/");
    var found = false;
    if(indexArray.length > 0) {
        //check if the first index is an array
        if(Array.isArray(dataset[indexArray[0]])) {
            //is a multiple step
            stepArray = dataset[indexArray[0]];
            stepArray.forEach(function(stepData) {
                if(stepData[indexArray[1]] != undefined){
                    found = findInStep(stepData, indexArray, value);
                    if(found ){
                        result = true
                    }
                }
            });
        }else{
            //is a single step 
            if(indexArray[1] != undefined) {
                found = findInStep(dataset[indexArray[0]], indexArray, value);
                if(found ){
                    result = true;
                }
            }else{ //is the swalllow id
                found = findInField(dataset[indexArray[0]], value);
                if(found ){
                    result = true;
                }       
            }            
        }
    }else{
        result = {"error":"index not found 1"};
    }
    return result;
}

function findIndataset(dataset, index, value) {
    var result = [];
    dataset.forEach(function(record) {
            var founded = findInRecord(record, index, value);
            if(founded){
                result.push(record);
            } 
        });   
    return result;
}

function serachOnDataset(dataset, value) {
    var result = [];
    indexes.forEach(function(index) {
        var founded = findIndataset(dataset, index, value);
        if(founded){
            result.push(founded);
        } 
    }); 
    //flatten the array
    result = result.flat();
    //remove duplicates
    result = removeDuplicates(result); 
    //sort by title
    result = sortByField(result, "Item_Description/title");  
    return result;

}

function filterdataset(collecionData, index, value){
    var result = [];
 
    result = findIndataset(collecionData, index, value);
    result = sortByField(result, "Item_Description/title");  
    return result;
}

function getRecord(dataset, value) {
    var result = [];
    dataset.forEach(function(record) {
        var founded = findInRecord(record, {"path":"swallow_id"}, value);
        if(founded){
            result = record;
        } 
    });    

    return (result);
}


function selectAll(){
    currentSelection = collecionData;
   currentSelection = sortByField(collecionData, "Item_Description/title");
}

function removeDuplicates(dataset){
    var result = [];
    dataset.forEach(function(record) {
        var founded = findInRecord(result, {"path":"swallow_id"}, record.swallow_id);
        if(!founded){
            result.push(record);
        } 
    });    
    return result;
}

function getSwallowIdList(dataset){
    var result = [];
    dataset.forEach(function(record) {
        result.push(record.swallow_id);
    });    
    return result;
}

function getValuesFromMultipleField(fieldArray, fieldPath){
    var result = [];
    fieldArray.forEach(function(field) {
        if(field[fieldPath] != undefined){
            result.push(field[fieldPath]);
        }
    });
    return result;

}

function getFieldValue(record, fieldPath){
    var fieldArray = fieldPath.split("/");
    var result = "";
    if(fieldArray.length > 0) {
        //check if the first index is an array
        if(Array.isArray(record[fieldArray[0]])) {
            //is a multiple step
            stepArray = record[fieldArray[0]];
            stepArray.forEach(function(stepData) {
                if(stepData[fieldArray[1]] != undefined){
                    result = stepData[fieldArray[1]];
                    if(Array.isArray(result)){ //is a multiple field
                        result = getValuesFromMultipleField(result, fieldArray[2]);
                    }
                }
            });
        }else{
            //is a single step 
            if(fieldArray[1] != undefined) {
                result = record[fieldArray[0]][fieldArray[1]];
                if(Array.isArray(result)){ //is a multiple field
                    result = getValuesFromMultipleField(result, fieldArray[2]);
                }
            }else{ //is the swalllow id
                result = record[fieldArray[0]];
            }            
        }
    }
    return result;
}

function getFieldList(dataset, fieldPath){
    var result = [];
    dataset.forEach(function(record) {
        var row = [];
        row['swallow_id'] = record['swallow_id'];
        var value = getFieldValue(record, fieldPath);
        row['value'] = value;
        result.push(row);
    });    
    return result;
}

function sortByField(dataset,fieldPath) {
    var result = [];
    var fieldList = getFieldList(dataset, fieldPath);
  
    fieldList.sort(function(a, b) {
        return a.value.localeCompare(b.value);
    });

    fieldList.forEach(function(row) {
        var record = getRecord(dataset, row.swallow_id);
        result.push(record);
    });    
    
    return result;
   
}