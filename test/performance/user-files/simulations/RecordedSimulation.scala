
import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class RecordedSimulation extends Simulation {

	val httpProtocol = http
		.baseURL("http://detectportal.firefox.com")
		.inferHtmlResources()
		.acceptHeader("*/*")
		.acceptEncodingHeader("gzip, deflate")
		.acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
		.userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:65.0) Gecko/20100101 Firefox/65.0")

	val headers_0 = Map("Pragma" -> "no-cache")

	val headers_9 = Map(
		"Accept" -> "image/webp,*/*",
		"DNT" -> "1")

    val uri1 = "http://127.0.0.1:8080/src/img/backgrounds/1.jpg"
    val uri2 = "http://detectportal.firefox.com/success.txt"

	val scn = scenario("RecordedSimulation")
		// inicio
		.exec(http("request_0")
			.get("/success.txt")
			.headers(headers_0))
		.pause(4)
		.exec(http("request_1")
			.get("/success.txt")
			.headers(headers_0))
		.pause(4)
		.exec(http("request_2")
			.get("/success.txt")
			.headers(headers_0))
		.pause(4)
		.exec(http("request_3")
			.get("/success.txt")
			.headers(headers_0))
		.pause(1)
		.exec(http("request_4")
			.get("/success.txt")
			.headers(headers_0))
		.pause(3)
		.exec(http("request_5")
			.get("/success.txt")
			.headers(headers_0)
			.resources(http("request_6")
			.get("/success.txt")
			.headers(headers_0),
            http("request_7")
			.get("/success.txt")
			.headers(headers_0),
            http("request_8")
			.get("/success.txt")
			.headers(headers_0)))
		.pause(1)
		.exec(http("request_9")
			.get(uri1 + "")
			.headers(headers_9)
			.resources(http("request_10")
			.get("/success.txt")
			.headers(headers_0),
            http("request_11")
			.get("/success.txt")
			.headers(headers_0)))
		.pause(2)
		.exec(http("request_12")
			.get("/success.txt")
			.headers(headers_0)
			.resources(http("request_13")
			.get("/success.txt")
			.headers(headers_0)))
		.pause(4)
		.exec(http("request_14")
			.get("/success.txt")
			.headers(headers_0)
			.resources(http("request_15")
			.get("/success.txt")
			.headers(headers_0),
            http("request_16")
			.get("/success.txt")
			.headers(headers_0),
            http("request_17")
			.get("/success.txt")
			.headers(headers_0)))
		.pause(4)
		.exec(http("request_18")
			.get("/success.txt")
			.headers(headers_0)
			.resources(http("request_19")
			.get("/success.txt")
			.headers(headers_0)))

	setUp(scn.inject(rampUsers(100) over (60 seconds)).protocols(httpProtocol))
}