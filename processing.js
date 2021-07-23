let imgElement = document.getElementById('imageSrc');
let inputElement = document.getElementById('fileInput');
let newParams = defaultParams;
inputElement.addEventListener('change', (e) => {
    imgElement.src = URL.createObjectURL(e.target.files[0]);
}, false);

function resetCircleImage() {
    let mat = cv.imread(imgElement);
    cv.imshow('imageCanvas', mat);
    mat.delete();
}

function resetBlobImage() {
    let mat = cv.imread(imgElement);
    cv.imshow('blobCanvas', mat);
    mat.delete();
}

imgElement.onload = function() {
    resetCircleImage();
    resetBlobImage();
};

function resetBlobParams() {
    newParams.minThreshold = 10;
    newParams.maxThreshold = 200;
    newParams.filterByColor = false;
    newParams.minArea = 10;
    newParams.filterByCircularity = true;
    newParams.minCircularity = 5000;
    newParams.minConvexity = 0.87;
    newParams.minInertiaRatio = 0.01;
    newParams.maxInertiaRatio = 500;

}

function drawBlob() {
    $( '#blobButton' ).disabled = true;
    oldtext = $( '#blobButton' ).innerHTML;
    $( '#blobButton' ).innerHTML = "Working...";
    let srcMat = cv.imread('blobCanvas');
    let displayMat = srcMat.clone();
    let keypoints = simpleBlobDetector(srcMat,newParams);
    for (let i = 0; i < keypoints.length; ++i) {
        let radius = keypoints[i].size/2;
        let center = keypoints[i].pt;
        cv.circle(displayMat, center, radius, [0, 255, 0, 255], 2);
    }
    cv.imshow('blobCanvas', displayMat);
    srcMat.delete();
    displayMat.delete();
    $( '#blobButton' ).innerHTML = oldtext;
    $( '#blobButton' ).disabled = false;
}

function buildBlobParams() {
    table = document.getElementById('blobParams');
    $.each(newParams, function(_key, _value) {
        tr=document.createElement('tr');
        tdkey=document.createElement('td');
        tdkey.innerHTML = _key;
        tdvalue=document.createElement('td');
        tr.appendChild(tdkey);
        tr.appendChild(tdvalue);
        table.appendChild(tr);
        if (typeof(_value) == 'boolean') {
            checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = _key;
            checkbox.checked = true;
            checkbox.innerHTML = _value;
            tdvalue.appendChild(checkbox);
            $('#'+_key).change(function() {
                resetBlobImage();
                newParams[_key] = this.checked;
                drawBlob();
            });
        } else {
            divv = document.createElement('div');
            divv.id = _key;
            divv.style = "width:260px; height: 5px;";
            divvhandle = document.createElement('div');
            divvhandle.className = "ui-slider-handle";
            divvhandle.id = _key+"handle";
            divv.appendChild(divvhandle);
            tdvalue.appendChild(divv);
            if (_value < 1) {
                calcMin = 0;
                calcMax = 1;
                calcStep = 0.01;
            } else {
                calcMin = 1;
                calcMax = _value * 2;
                calcStep = 1;
            }
            $('#'+_key).slider({
                value: _value,
                orientation: "horizontal",
                range: "min",
                min: calcMin,
                max: calcMax,
                step: calcStep,
                animate: true,
                create: function() {
                    $( "#"+_key+"handle" ).text( $( this ).slider( "value" ) );
                },
                slide: function( event, ui ) {
                    $( "#"+_key+"handle" ).text( ui.value );
                    resetBlobImage();
                    newParams[_key] = ui.value;
                    drawBlob();
                }
            });
        }
    });
}

function onOpenCvReady() {
    document.getElementById('status').innerHTML = 'OpenCV.js is ready.';
    resetBlobParams();
    buildBlobParams();
    if (imgElement.src != '') {
        imgElement.setAttribute('crossOrigin', 'Anonymous');
        resetCircleImage();
        resetBlobImage();
    }
}

document.getElementById('resetCircle').onclick = function() {
    resetCircleImage();
};

document.getElementById('resetBlob').onclick = function() {
    resetBlobImage();
};

function drawCircles() {
    $('#circlesButton').attr("disabled", true);
    oldtext = $('#circlesButton').text();
    $('#circlesButton').text("Working...");
    let srcMat = cv.imread('imageCanvas');
    let displayMat = srcMat.clone();
    let circlesMat = new cv.Mat();
    cv.cvtColor(srcMat, srcMat, cv.COLOR_RGBA2GRAY);
    mindist = $( "#circleMinDist" ).slider( "value" );
    p1 = $( "#circleParam1" ).slider( "value" );
    p2 = $( "#circleParam2" ).slider( "value" );
    cv.HoughCircles(srcMat, circlesMat, cv.HOUGH_GRADIENT, 1, 45, p1, p2, 0, 0);
    for (let i = 0; i < circlesMat.cols; ++i) {
        let x = circlesMat.data32F[i * 3];
        let y = circlesMat.data32F[i * 3 + 1];
        let radius = circlesMat.data32F[i * 3 + 2];
        let center = new cv.Point(x, y);
        cv.circle(displayMat, center, radius, [0, 255, 0, 255], 3);
    }
    cv.imshow('imageCanvas', displayMat);
    srcMat.delete();
    displayMat.delete();
    circlesMat.delete();
    $('#circlesButton').text(oldtext);
    $('#circlesButton').attr("disabled", false);
}

document.getElementById('circlesButton').onclick = function() {
    drawCircles();
};

$( "#circleMinDist" ).slider({
    value: 50,
    orientation: "horizontal",
    range: "min",
    animate: true,
    create: function() {
        $( "#custom-handle-mindist" ).text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        $( "#custom-handle-mindist" ).text( ui.value );
        resetCircleImage();
        drawCircles();
    }
});

$( "#circleParam1" ).slider({
    value: 50,
    orientation: "horizontal",
    range: "min",
    min: 1,
    animate: true,
    create: function() {
        $( "#custom-handle1" ).text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        $( "#custom-handle1" ).text( ui.value );
        resetCircleImage();
        drawCircles();
    }
});

$( "#circleParam2" ).slider({
    value: 60,
    orientation: "horizontal",
    range: "min",
    min: 10,
    animate: true,
    create: function() {
        $( "#custom-handle2" ).text( $( this ).slider( "value" ) );
    },
    slide: function( event, ui ) {
        $( "#custom-handle2" ).text( ui.value );
        resetCircleImage();
        drawCircles();
    }
});

// Setup Blob

document.getElementById('blobButton').onclick = function() {
    drawBlob();
};