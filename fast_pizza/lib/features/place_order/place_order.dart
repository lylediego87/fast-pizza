import 'package:fast_pizza/features/map_display/map_display.dart';
import 'package:flutter/material.dart';
import 'package:flutter_google_places_web/flutter_google_places_web.dart';

class PlaceOrder extends StatefulWidget {
  const PlaceOrder({Key? key}) : super(key: key);

  @override
  State<PlaceOrder> createState() => _PlaceOrderState();
}

class _PlaceOrderState extends State<PlaceOrder> {
  String _placeName = '';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Fast Pizza "),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          children: <Widget>[
            const Padding(
              padding: EdgeInsets.only(top: 10),
              child: Text(
                'Enter your delivery address',
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20),
              child: FlutterGooglePlacesWeb(
                components: "country:id",
                apiKey: "AIzaSyAklMUtI36qhngpcVZCAYwrGRdnyO0FCh0",
                proxyURL: 'https://cors-anywhere.herokuapp.com/',
                required: true,
              ),
            ),
            TextButton(
              onPressed: () async {
                _placeName = FlutterGooglePlacesWeb.value['name'].toString();
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MapsDisplay(_placeName),
                  ),
                );
              },
              child: const Text('Click to Fast Pizza near you'),
            ),
          ],
        ),
      ),
    );
  }
}
