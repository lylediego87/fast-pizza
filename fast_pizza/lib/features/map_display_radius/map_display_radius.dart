import 'dart:collection';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:http/http.dart' as http;

class MapsDisplayRadius extends StatefulWidget {
  final String place;

  const MapsDisplayRadius(this.place, {Key? key}) : super(key: key);

  @override
  _MapsDisplayRadiusState createState() => _MapsDisplayRadiusState();
}

class _MapsDisplayRadiusState extends State<MapsDisplayRadius> {
  GoogleMapController? _googleMapController;

  final LatLng _centralJakarta =
      const LatLng(-6.190661334599699, 106.82895257992107);

  Set<Circle> _circles = HashSet<Circle>();
  Set<Marker> _markers = HashSet<Marker>();
  @override
  void initState() {
    super.initState();
    _makeHttpRequest(widget.place);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        alignment: Alignment.center,
        children: [
          GoogleMap(
              myLocationEnabled: false,
              zoomControlsEnabled: false,
              initialCameraPosition:
                  CameraPosition(target: _centralJakarta, zoom: 15),
              markers: Set<Marker>.of(_markers),
              circles: _circles,
              onMapCreated: (controller) => _googleMapController = controller),
          Positioned(
              top: 20,
              child: Padding(
                  padding: const EdgeInsets.all(10),
                  child: Center(
                      child: ElevatedButton(
                    onPressed: () {
                      _makeHttpRequest(widget.place);
                    },
                    child: const Text(
                      "Calculate Nearest Drivers",
                      style: TextStyle(color: Colors.white),
                    ),
                    style: ElevatedButton.styleFrom(
                      fixedSize: Size(MediaQuery.of(context).size.width, 40),
                      primary: Colors.amber,
                      elevation: 5.0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(15),
                      ),
                    ),
                  )))),
        ],
      ),
    );
  }

  void _makeHttpRequest(String place) async {
    setState(() {
      _markers.clear();
      _circles.clear();
    });
    var url = Uri.http('localhost:3000', '/radius', {'place': place});

    var response = await http.get(url);
    if (response.statusCode == 200) {
      final Map<String, dynamic> result = jsonDecode(response.body);
      Set<Marker> markers = HashSet<Marker>();
      Set<Circle> circles = HashSet<Circle>();

      var userLocation =
          LatLng(result['user']['latitude'], result['user']['longitude']);

      circles.add(Circle(
          circleId: const CircleId("radius"),
          center: userLocation,
          radius: 5000,
          strokeWidth: 5,
          strokeColor: Colors.red));

      markers.add(Marker(
          markerId: const MarkerId("User"),
          infoWindow: const InfoWindow(title: "Your location"),
          icon:
              BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
          position: userLocation));

      for (var driver in result['drivers']) {
        var driverCode = driver['driverId'].toString();
        var distance = driver['distance'].toString();
        var driverLocation = LatLng(driver['latitude'], driver['longitude']);
        markers.add(Marker(
            markerId: MarkerId(driverCode),
            infoWindow: InfoWindow(
                title: 'Driver - $driverCode', snippet: "$distance km"),
            icon: BitmapDescriptor.defaultMarkerWithHue(
                BitmapDescriptor.hueGreen),
            position: driverLocation));
      }

      setState(() {
        _markers = markers;
        _circles = circles;
      });

      _googleMapController!.animateCamera(CameraUpdate.newCameraPosition(
          CameraPosition(target: userLocation, zoom: 15)));
    }
  }

  @override
  void dispose() {
    _googleMapController!.dispose();
    super.dispose();
  }
}
