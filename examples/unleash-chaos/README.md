`-> API Gateway -> lambda -> 3rd party API`

This example shows what happens if 3rd party API becomes unavailable.

- Are timeout detected properly?
- Do we interrupt http connection if API are not responsive?
- Do we handle API errors gracefully?
- What happens if API return malformed data?

Based on the examples from [Chaos engineering and AWS Lambda Latency Injection](https://hackernoon.com/chaos-engineering-and-aws-lambda-latency-injection-ddeb4ff8d983)
