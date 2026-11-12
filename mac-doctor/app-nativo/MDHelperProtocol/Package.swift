// swift-tools-version: 6.0
// MDHelperProtocol: contrato XPC entre app e helper (SPEC 7). Pacote aberto (F6): depende só do MDModel.
import PackageDescription

let package = Package(
    name: "MDHelperProtocol",
    platforms: [.macOS(.v15)],
    products: [
        .library(name: "MDHelperProtocol", targets: ["MDHelperProtocol"])
    ],
    dependencies: [
        .package(path: "../MDModel")
    ],
    targets: [
        .target(name: "MDHelperProtocol", dependencies: ["MDModel"]),
        .testTarget(name: "MDHelperProtocolTests", dependencies: ["MDHelperProtocol"]),
    ]
)
