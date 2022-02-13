import 'dart:collection';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_polyline_points/flutter_polyline_points.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

class MapsDisplay extends StatefulWidget {
  final String place;

  const MapsDisplay(this.place, {Key? key}) : super(key: key);

  @override
  _MapsDisplayState createState() => _MapsDisplayState();
}

class _MapsDisplayState extends State<MapsDisplay> {
  GoogleMapController? _googleMapController;

  final LatLng _centralJakarta =
      const LatLng(-6.190661334599699, 106.82895257992107);
  final _channel = WebSocketChannel.connect(Uri.parse('ws://localhost:3000/'));
  Set<Marker> _markers = HashSet<Marker>();

  List<PointLatLng>? _polylines;
  double? _distance;
  String? _driverId;

  @override
  void initState() {
    super.initState();
    initiateRequest(widget.place);
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
              polylines: {
                if (_polylines != null)
                  Polyline(
                      polylineId: const PolylineId('diagonalLine'),
                      color: Colors.red,
                      width: 7,
                      points: _polylines!
                          .map((e) => LatLng(e.latitude, e.longitude))
                          .toList())
              },
              onMapCreated: (controller) => _googleMapController = controller),
          if (_driverId != null)
            Positioned(
                top: 20,
                child: Container(
                    height: 100,
                    width: 300,
                    child: Padding(
                      padding: const EdgeInsets.all(10),
                      child: Column(
                        children: [
                          Text('Driver - $_driverId',
                              style: const TextStyle(fontSize: 15)),
                          Text('Distance - \n km $_distance',
                              style: const TextStyle(fontSize: 20)),
                        ],
                      ),
                    ),
                    decoration: BoxDecoration(
                        color: Colors.amberAccent,
                        borderRadius: BorderRadius.circular(20.0),
                        boxShadow: const [
                          BoxShadow(
                              color: Colors.black26,
                              offset: Offset(0, 2),
                              blurRadius: 6.0)
                        ]))),
        ],
      ),
    );
  }

  void initiateRequest(String place) async {
    _channel.sink.add(jsonEncode(place));

    _channel.stream.listen((data) {
      final Map<String, dynamic> result = jsonDecode(data);
      print(result);
      var userLocation = LatLng(result['userLocation']['latitude'],
          result['userLocation']['longitude']);

      var driverLocation = LatLng(result['nearestDriver']['latitude'],
          result['nearestDriver']['longitude']);

      _addMarkers(userLocation, driverLocation);
      _drawPolyline(userLocation, driverLocation);

      setState(() {
        _distance = result['nearestDriver']['distance'];
        _driverId = result['nearestDriver']['driverId'];
      });

      _googleMapController!.animateCamera(CameraUpdate.newCameraPosition(
          CameraPosition(target: driverLocation, zoom: 15)));
    });
  }

  void _drawPolyline(LatLng userLocation, LatLng driverLocation) {
    setState(() {
      _polylines = [
        PointLatLng(driverLocation.latitude, driverLocation.longitude),
        PointLatLng(userLocation.latitude, userLocation.longitude)
      ];
    });
  }

  void _addMarkers(LatLng userLocation, LatLng driverLocation) {
    setState(() {
      _markers.clear();
    });
    Set<Marker> markers = HashSet<Marker>();
    markers.add(Marker(
        markerId: const MarkerId('user'),
        infoWindow: const InfoWindow(title: 'Your Position'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueGreen),
        position: userLocation));
    markers.add(Marker(
        markerId: const MarkerId('driver'),
        infoWindow: const InfoWindow(title: 'Nearest Driver Position'),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        position: driverLocation));

    setState(() {
      _markers = markers;
    });
  }

  @override
  void dispose() {
    _googleMapController!.dispose();
    super.dispose();
  }
}
