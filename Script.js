// ======================================================
// CONFIG — paste your Apps Script Web App /exec URL here
// ======================================================

const API_URL = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_EXEC_URL_HERE";


window.onload=function(){

    document.getElementById("plantationDate").valueAsDate=new Date();

    document.getElementById("status").innerHTML="❌ Location not captured";

    document.getElementById("status").style.color="red";

    loadPanchayats();

};

// ======================================================
// LOAD PANCHAYATS (via fetch GET — replaces google.script.run)
// ======================================================

function loadPanchayats(){

    fetch(API_URL + "?action=panchayats")

    .then(function(response){
        return response.json();
    })

    .then(function(result){

        if(!result.success){
            throw new Error(result.message || "Failed to load Panchayats.");
        }

        const dropdown=document.getElementById("panchayat");

        dropdown.innerHTML="<option value=''>-- Select Panchayat --</option>";

        result.data.forEach(function(name){

            const option=document.createElement("option");

            option.value=name;

            option.textContent=name;

            dropdown.appendChild(option);

        });

    })

    .catch(function(err){

        alert("Unable to load Panchayat list.\n\n" + err.message);

    });

}

// ======================================================
// Capture Location
// ======================================================

function captureLocation(){

    const status=document.getElementById("status");

    status.innerHTML="⏳ Capturing Location...";
    status.style.color="#FB8C00";

    document.getElementById("lat").value="";
    document.getElementById("lng").value="";

    if(!navigator.geolocation){

        alert("Geolocation is not supported.");

        return;

    }

    const startTime=Date.now();

    navigator.geolocation.getCurrentPosition(

        function(position){

            const elapsed=Date.now()-startTime;

            const remaining=Math.max(1000-elapsed,0);

            setTimeout(function(){

                document.getElementById("lat").value=position.coords.latitude;

                document.getElementById("lng").value=position.coords.longitude;

                status.innerHTML="✅ Location Captured Successfully";

                status.style.color="#188038";

            },remaining);

        },

        function(error){

            status.innerHTML="❌ Location not captured";

            status.style.color="red";

            switch(error.code){

                case error.PERMISSION_DENIED:
                    alert("Location permission denied.");
                    break;

                case error.POSITION_UNAVAILABLE:
                    alert("Location unavailable.");
                    break;

                case error.TIMEOUT:
                    alert("Location request timed out.");
                    break;

                default:
                    alert("Unable to capture location.");

            }

        },

        {

            enableHighAccuracy:true,
            timeout:15000,
            maximumAge:0

        }

    );

}



// ======================================================
// Loading
// ======================================================

function startLoading(message){

    document.getElementById("loadingBox").style.display="block";

    document.getElementById("loadingText").innerHTML=message;

    document.getElementById("submitBtn").disabled=true;

    document.getElementById("clearBtn").disabled=true;

    document.getElementById("submitBtn").innerHTML="Submitting...";

}

function stopLoading(){

    document.getElementById("loadingBox").style.display="none";

    document.getElementById("submitBtn").disabled=false;

    document.getElementById("clearBtn").disabled=false;

    document.getElementById("submitBtn").innerHTML="Submit";

}



// ======================================================
// Convert Image
// ======================================================

function fileToBase64(file){

    return new Promise(function(resolve,reject){

        const reader=new FileReader();

        reader.onload=function(){

            resolve(reader.result);

        };

        reader.onerror=reject;

        reader.readAsDataURL(file);

    });

}



// ======================================================
// Submit (single fetch POST — replaces the two
// google.script.run calls to uploadPhoto + saveSubmission)
// ======================================================

async function submitForm(){

    const plantationDate=document.getElementById("plantationDate").value;

    const panchayat=document.getElementById("panchayat").value;

    const sarpanchName=document.getElementById("sarpanchName").value.trim();

    const secretaryName=document.getElementById("secretaryName").value.trim();

    const secretaryMobile=document.getElementById("secretaryMobile").value.trim();

    const latitude=document.getElementById("lat").value;

    const longitude=document.getElementById("lng").value;

    const photoInput=document.getElementById("photo");



    if(plantationDate===""){

        alert("Please select Plantation Date.");

        return;

    }

    if(panchayat===""){

        alert("Please select Panchayat.");

        return;

    }

    if(sarpanchName===""){

        alert("Please enter Sarpanch Name.");

        return;

    }

    if(secretaryName===""){

        alert("Please enter Secretary Name.");

        return;

    }

    if(latitude===""){

        alert("Please capture location.");

        return;

    }

    if(photoInput.files.length===0){

        alert("Please upload a plantation photo.");

        return;

    }

    startLoading("Uploading Photo & Saving Data...");

    try{

        const file=photoInput.files[0];

        const base64=await fileToBase64(file);

        const payload={

            plantationDate:plantationDate,

            panchayat:panchayat,

            sarpanchName:sarpanchName,

            secretaryName:secretaryName,

            secretaryMobile:secretaryMobile,

            latitude:latitude,

            longitude:longitude,

            photo:base64,

            fileName:file.name

        };

        // IMPORTANT: do NOT set a Content-Type header here.
        // Leaving it as the browser default (text/plain) keeps this
        // a "simple request" so the browser skips the CORS preflight
        // (OPTIONS) call, which Apps Script Web Apps don't handle.
        const response=await fetch(API_URL,{

            method:"POST",

            body:JSON.stringify(payload)

        });

        const result=await response.json();

        if(!result.success){
            throw new Error(result.message || "Submission failed.");
        }

        stopLoading();

        alert("✅ Plantation details submitted successfully.");

        clearForm();

    }

    catch(err){

        stopLoading();

        alert("❌ " + err.message);

    }

}



// ======================================================
// Clear Form
// ======================================================

function clearForm(){

    document.getElementById("plantationDate").valueAsDate=new Date();

    document.getElementById("panchayat").selectedIndex=0;

    document.getElementById("sarpanchName").value="";

    document.getElementById("secretaryName").value="";

    document.getElementById("secretaryMobile").value="";

    document.getElementById("photo").value="";

    document.getElementById("lat").value="";

    document.getElementById("lng").value="";

    document.getElementById("status").innerHTML="❌ Location not captured";

    document.getElementById("status").style.color="red";

}



// ======================================================
// Allow Enter key to Submit
// ======================================================

document.addEventListener("keydown",function(e){

    if(e.key==="Enter" && e.target.tagName!=="TEXTAREA"){

        e.preventDefault();

        submitForm();

    }

});
