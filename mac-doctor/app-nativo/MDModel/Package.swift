// swift-tools-version: 6.0
// MDModel: tipos de achado, evidência, severidade e snapshot (SPEC 6.2). Sem I/O, sem AppKit.
import PackageDescription

let package = Package(
    name: "MDModel",
    platforms: [.macOS(.v15)],
    products: [
        .library(name: "MDModel", targets: ["MDModel"])
    ],
    targets: [
        .target(name: "MDModel"),
        .testTarget(name: "MDModelTests", dependencies: ["MDModel"]),
    ]
)
