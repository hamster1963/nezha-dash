"use client";

import DottedMap from "dotted-map";

export default function Global() {

    const map = new DottedMap({ height: 60, grid: "vertical" });

    map.addPin({
        lat: 40.73061,
        lng: -73.935242,
        svgOptions: { color: '#FF4500', radius: 0.4 },
    });
    map.addPin({
        lat: 48.8534,
        lng: 2.3488,
        svgOptions: { color: '#FF4500', radius: 0.4 },
    });


    const svgMap = map.getSVG({
        radius: 0.35,
        color: "#D1D5DA",
        shape: "circle",
        // backgroundColor: "#15103E"
    });



    return (
        <img
            src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
            alt=""
        />
    );
}