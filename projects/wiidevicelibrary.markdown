Title: Wii Device Library

The Wii Device Library is a cross platform C# class library that provides an interface to various Wii related devices, like the Wiimote, Classic Controller, Nunchuk and Balance Board.

It's possible to use Wii devices like the Wiimote or Balance Board with your computer. All you need besides one of these devices is some kind of bluetooth device. This could either be a bluetooth dongle or bluetooth built into your pc or laptop.

When using the Wii Device Library you don't have to worry about all the bluetooth stuff, you can just access your device of choice through a *simple and intuitive interface*. Also new Wii devices and extensions can be implemented by this interface without recompiling Wii Device Library.

Another nice feature is the ability to scan for Wii devices through bluetooth and connect to them when they are available. This makes it possible to *automatically connect to Wii devices* when they are syncing. It uses the libraries of several bluetooth stacks to scan, connect and communicate with the Wii devices. Also this part of the library can be extended with support for more bluetooth stacks and/or operating systems.

We would like to thank the members of [WiiBrew](http://www.wiibrew.org/) and WiiLi for the time and effort they put into figuring out how the Wiimote, its extensions and the Balanceboard operate. We also want to mention Brian Peek and his [WiimoteLib](http://www.wiimotelib.org/), part of which was used in Wii Device Library. Without these sources, we wouldn’t have been able to create this library.

### Supported Wii devices

* Wiimote
* Nunchuk
* Classic Controller
* Guitar
* Balance Board

### Supported bluetooth stacks

* Microsoft bluetooth
* BlueSoleil
* BlueZ

### Features

* A simple and intuitive programming interface.
* The ability to scan and connect to Wii devices.
* Wiimote extension support with a wide range of implemented extensions.
* Support for multiple stacks.
* The ability to extend the library to support more Wiimote extensions, devices and stacks.

### Code Examples
The following code demonstrates how to use the scanning functionality:

    // Create an device provider based on the environment's bluetooth stack.
    IDeviceProvider deviceProvider = DeviceProviderRegistry.CreateSupportedDeviceProvider();
    
    deviceProvider.DeviceFound += deviceProvider_DeviceFound;
    deviceProvider.DeviceLost += deviceProvider_DeviceLost;
    
    // Start scanning for available Wii devices.
    deviceProvider.StartDiscovering();
    ...
    private void deviceProvider_DeviceFound(object sender, DeviceInfoEventArgs args)
    {
    	// Found an available device.
    	// To connect we do the following:
    	IDevice device = deviceProvider.Connect(args.DeviceInfo);
    	// We are now connected and can communicate through the IDevice.
    }
    
    private void deviceProvider_DeviceLost(object sender, DeviceInfoEventArgs args)
    {
    	// A device was not available anymore.
    }

The following code demonstrates how we can use a Wiimote device after connecting:

    IWiimote wiimote = (IWiimote)device;
    
    // Enable the first and the last leds on the Wiimote.
    wiimote.Leds = WiimoteLeds.Led1 | WiimoteLeds.Led4;
    
    ...

### Releases

* [v1.0](/files/WiiDeviceLibrary-1.0.zip)
* [v1.1](/files/WiiDeviceLibrary-v1.1.zip)
* [v1.2](/files/WiiDeviceLibrary-v1.2.zip)

### Source code

[Github](https://github.com/FrozenCow/wiidevicelibrary).
