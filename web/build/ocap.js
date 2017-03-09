(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

function parseOcapFormat(dataString) {
  const [headerData, ...events] = dataString.split(/[\r\n]+/)
      .map(line => line.split(';').filter(entry => entry)
          .map(entry => entry.split(',')
              .map(processEntry)));

  return {
    header: processHeaderData(headerData),
    events,
  };
}

function processHeaderData(data) {
  const [worldName, missionName, author, captureInterval] = data[0];
  return {
    worldName,
    missionName,
    author,
    captureInterval,
  };
}

function processEntry(entry) {
  const number = Number.parseFloat(entry);
  return Number.isNaN(number) ? entry : number;
}

const mapIndexUrl = "images/maps/maps.json";
const captureIndexUrl = "data/index.json";

(function initOCAP() {
  return Promise.all([
    fetch(mapIndexUrl).then(response => response.json()),
    fetch(captureIndexUrl).then(response => response.json()),
  ]).then(([mapIndex, captureIndex]) => {

    //ui.setModalOpList(opList);
    //window.addEventListener("keypress", event => event.charCode === 32 && event.preventDefault());

    return loadCaptureFile(captureIndex[0].file);
  }).catch(error => console.error(error));
}());

// Read operation JSON data and create unit objects
function loadCaptureFile(captureFilePath) {
  return fetch(captureFilePath).then(response => response.text()).then(parseOcapFormat).then(({ header, events }) => {

    console.log(header, events);
    /*
    ui.setMissionName(header.missionName);
    ui.setMissionEndTime(events.length);

    initMap(worlds.find(world => world.worldName.toLowerCase() == header.worldName.toLowerCase()), header.worldName);
    toggleHitEvents(false);
    startPlaybackLoop();
    ui.hideModal();
    */
  });
}

})));
