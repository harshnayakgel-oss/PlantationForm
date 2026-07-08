<script>

window.onload=function(){

    document.getElementById("plantationDate").valueAsDate=new Date();

    document.getElementById("status").innerHTML="❌ Location not captured";

    document.getElementById("status").style.color="red";

    loadPanchayats();

};

// ======================================================
// LOAD PANCHAYATS
// ======================================================

function loadPanchayats(){

    google.script.run

    .withSuccessHandler(function(list){

        const dropdown=document.getElementById("panchayat");

        dropdown.innerHTML="<option value=''>-- Select Panchayat --</option>";

        list.forEach(function(name){

            const option=document.createElement("option");

            option.value=name;

            option.textContent=name;

            dropdown.appendChild(option);

        });

    })

    .withFailureHandler(function(){

        alert("Unable to load Panchayat list.");

    })

    .getPanchayats();

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
// Submit
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

    startLoading("Uploading Photo...");

    const file=photoInput.files[0];

    const base64=await fileToBase64(file);

    google.script.run

    .withSuccessHandler(function(uploadResult){

        document.getElementById("loadingText").innerHTML="Saving Data...";

        const data={

            plantationDate:plantationDate,

            panchayat:panchayat,

            sarpanchName:sarpanchName,

            secretaryName:secretaryName,

            secretaryMobile:secretaryMobile,

            latitude:latitude,

            longitude:longitude,

            photoLink:uploadResult.url

        };

        google.script.run

        .withSuccessHandler(function(){

            stopLoading();

            alert("✅ Plantation details submitted successfully.");

            clearForm();

        })

        .withFailureHandler(function(err){

            stopLoading();

            alert(err.message);

        })

        .saveSubmission(data);

    })

    .withFailureHandler(function(err){

        stopLoading();

        alert(err.message);

    })

    .uploadPhoto(base64,file.name);

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

</script>
