"""AWS-style architecture diagram for the Algorithm-Selection Co-pilot demo.

Renders with the `diagrams` library (official AWS icon set) via:
    uv run --with diagrams python3 architecture_diagram.py
Produces architecture.png. Requires graphviz `dot` on PATH.
"""
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda
from diagrams.aws.ml import Bedrock
from diagrams.aws.network import CloudFront, APIGateway
from diagrams.aws.storage import SimpleStorageServiceS3 as S3
from diagrams.aws.security import Cognito, IAMRole
from diagrams.aws.management import Cloudwatch
from diagrams.aws.devtools import Cloud9 as CodeBuildLike  # stand-in for CDK/dev
from diagrams.aws.general import Users, InternetAlt1, GenericSamlToken
from diagrams.onprem.client import Client
from diagrams.onprem.vcs import Github

graph_attr = {
    "fontname": "Helvetica",
    "fontsize": "20",
    "labelloc": "t",
    "label": "Algorithm-Selection Co·pilot — Amazon Bedrock AgentCore\n"
             "(Evaluate → Remember → Verify · one CDK deploy · GitHub + Gitee reproducible)",
    "pad": "0.6",
    "splines": "spline",
    "nodesep": "0.6",
    "ranksep": "1.0",
    "bgcolor": "white",
}
node_attr = {"fontname": "Helvetica", "fontsize": "12"}
edge_orange = {"color": "#ec7211", "penwidth": "2.2"}
edge_grey = {"color": "#5b6577", "penwidth": "1.5"}

with Diagram(
    "architecture",
    filename="architecture",
    outformat="png",
    show=False,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
):
    visitor = Users("Algorithm team\n(booth visitor)")

    with Cluster("Client (booth)"):
        spa = CloudFront("Web Console SPA\nS3 + CloudFront (OAC)")
        cli = Client("CLI · demo.sh\n(clone-and-run)")

    with Cluster("Edge / Auth — account-safe (no public principals)"):
        cognito = Cognito("Amazon Cognito\nUser Pool · Hosted UI (PKCE)")
        apigw = APIGateway("API Gateway\nHTTP API · CORS")
        relay = Lambda("Relay Lambda\nverify JWT → SigV4 invoke")

    with Cluster("Amazon Bedrock AgentCore  ★ HIGHLIGHT"):
        with Cluster("AgentCore Runtime (serverless ARM64 microVM)"):
            agent = Bedrock("Strands Agent\n+ Agent Skills plugin\nmodel: Claude")
            obs = Cloudwatch("AgentCore Observability\ntraces every tool call")

        memory = Bedrock("◆ AgentCore Memory\nSEMANTIC + SUMMARIZATION\ncross-session recall")
        ci = Bedrock("▶ AgentCore Code Interpreter\nisolated sandbox · real benchmark")

    with Cluster("External sources"):
        sources = InternetAlt1("arXiv · Hugging Face\nopen-source repos")

    repo = Github("GitHub + Gitee\nApache-2.0 · TS CDK")

    # ---- flows ----
    visitor >> Edge(**edge_grey) >> spa
    visitor >> Edge(**edge_grey, style="dashed") >> cli

    spa >> Edge(label="1 login", **edge_grey) >> cognito
    spa >> Edge(label="2 POST /invoke", **edge_grey) >> apigw
    apigw >> Edge(**edge_grey) >> relay
    relay >> Edge(label="3 InvokeAgentRuntime", **edge_orange) >> agent
    cli >> Edge(label="CLI path (local creds)", style="dashed", **edge_grey) >> agent

    agent >> Edge(label="remember / recall", **edge_orange) >> memory
    agent >> Edge(label="run & verify", **edge_orange) >> ci
    agent >> Edge(**edge_grey) >> sources
    agent >> Edge(style="dotted", **edge_grey) >> obs

    repo >> Edge(label="cdk deploy --all", style="dotted", **edge_grey) >> spa
