import React from "react";
import PublicNavbar from "../components/PublicNavbar";
import DocSidebar from "../components/DocSidebar";
import Footer from "../components/Footer";

export default function Documentation() {
    return (
        <div className="bg-white text-black">

            {/* NAVBAR */}
            <PublicNavbar />

            {/* PAGE LAYOUT */}
            <div className="flex pt-[62px]">

                {/* SIDEBAR */}
                <DocSidebar />

                {/* CONTENT */}
                <main className="flex-1 px-10 py-16 space-y-32 max-w-4xl">

                    {/* ================= INTRO ================= */}
                    <section id="intro">
                        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                        <p className="text-gray-600 mt-4">
                            VIEWER is an AI-powered DevOps inspection platform designed to simplify the
                            way developers and engineers interact with Kubernetes clusters. Traditional
                            cluster monitoring relies heavily on complex CLI commands, scattered dashboards
                            , and deep operational knowledge, making it difficult for developers to quickly
                            understand cluster behavior. VIEWER solves this problem by providing a visual,
                            intelligent, and read-only interface that transforms raw Kubernetes data into
                            clear, actionable insights.
                            The platform integrates container orchestration data, workload metrics, and cluster
                            health signals into a unified dashboard, allowing users to explore pods, nodes,
                            namespaces, deployments, and resource usage without relying on kubectl commands.
                            A built-in AI assistant enables users to ask natural language questions such as
                            “Which pods are restarting?” or “Why is memory usage high?”, and instantly receive
                            human-readable explanations of cluster state and anomalies.
                            VIEWER is designed with security and safety in mind, operating strictly in read-only
                            mode to prevent accidental changes to production environments.
                        </p>
                        <p className="text-gray-600 mt-4">
                            The system is ideal for
                            DevOps developers who want to understand Kubernetes behavior, debug issues faster, and
                            gain operational clarity without operational risk. By combining AI-driven explanations
                            with visual inspection, VIEWER bridges the gap between complex infrastructure and human
                            understanding, making Kubernetes accessible, explainable, and developer-friendly.
                            This documentation explains how to set up your environment, connect your
                            cluster, and use VIEWER to inspect workloads, metrics, logs, and cluster health
                            safely in read-only mode.
                        </p>
                    </section>

                    {/* ================= KUBERNETES ================= */}
                    <section id="kubernetes">
                        <h2 className="text-2xl font-semibold mb-4">What is Kubernetes?</h2>
                        <p className="text-gray-600 mb-4">
                            Kubernetes is an open-source container orchestration platform developed
                            to manage the full lifecycle of containerized applications. It automates
                            critical operational tasks such as application deployment, scaling,
                            load balancing, self-healing, and resource allocation across
                            distributed environments. By abstracting infrastructure complexity,
                            Kubernetes allows developers to focus on building applications
                            rather than managing servers.

                            Engineers also rely
                            on different tools for logs, metrics, and resource monitoring,
                            which fragments visibility and slows down troubleshooting.
                        </p>
                        <p className="text-gray-600 mb-4">
                            In modern DevOps workflows, Kubernetes acts as the central control
                            plane for running microservices reliably across clusters. It
                            continuously monitors the desired state of applications and
                            automatically takes corrective actions such as restarting failed
                            containers, rescheduling workloads, and scaling services based on
                            demand. Kubernetes is widely used in cloud-native environments where
                            applications must remain highly available, resilient, and scalable.
                            Despite its power, Kubernetes introduces significant operational
                            complexity. Understanding the real-time state of a cluster often
                            requires running multiple kubectl commands, switching between
                            contexts, and interpreting raw YAML outputs.
                        </p>
                        <p className="text-gray-600">
                            VIEWER addresses this challenge by transforming Kubernetes data
                            into a unified visual experience. Instead of relying on CLI
                            commands, users can inspect pods, nodes, namespaces, deployments,
                            and resource usage through an intuitive interface. By combining
                            visual inspection with AI-powered explanations, VIEWER enables
                            developers and learners to understand cluster behavior quickly,
                            safely, and confidently — without the need to master complex
                            command-line workflows.
                        </p>
                    </section>

                    {/* ================= SETUP ================= */}
                    <section id="setup" className="space-y-6">
                        <h2 className="text-2xl font-semibold">Setup & Requirements</h2>

                        <p className="text-gray-600">
                            Before using VIEWER, ensure that your local or remote environment is correctly
                            configured. These prerequisites are required for VIEWER to connect to your
                            Kubernetes cluster and display data accurately.
                        </p>

                        {/* Docker */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">1. Docker</h3>
                            <p className="text-gray-600">
                                Docker must be installed and running on your system. VIEWER relies on Docker
                                to run supporting services and to ensure container-based components operate
                                correctly.
                            </p>
                            <pre className="bg-gray-100 p-3 rounded text-sm">
                                docker --version
                            </pre>
                        </div>

                        {/* Kubernetes */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">2. Kubernetes Cluster</h3>
                            <p className="text-gray-600">
                                An active Kubernetes cluster is required. VIEWER supports both local and
                                cloud-based clusters:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Local clusters (Minikube, Kind)</li>
                                <li>Cloud clusters (AWS EKS, Azure AKS, Google GKE)</li>
                            </ul>
                            <p className="text-gray-600">
                                Ensure your cluster is running and reachable before proceeding.
                            </p>
                        </div>

                        {/* kubectl */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">3. kubectl Configuration</h3>
                            <p className="text-gray-600">
                                The kubectl CLI must be installed and configured with the correct context.
                                VIEWER uses the current kubeconfig context to fetch cluster resources securely
                                in read-only mode.
                            </p>
                            <pre className="bg-gray-100 p-3 rounded text-sm">
                                kubectl config current-context
                            </pre>
                        </div>

                        {/* Backend */}
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">4. VIEWER Backend Service</h3>
                            <p className="text-gray-600">
                                The VIEWER backend must be running to process requests and collect cluster
                                information. Once active, it automatically connects to your cluster using
                                the configured context.
                            </p>
                        </div>

                        {/* Auto detection */}
                        <div className="space-y-2 pt-4 border-t">
                            <h3 className="font-semibold text-lg">Automatic Cluster Detection</h3>
                            <p className="text-gray-600">
                                When all requirements are met, VIEWER automatically detects:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Active cluster context</li>
                                <li>Namespaces</li>
                                <li>Workloads</li>
                                <li>Nodes</li>
                                <li>Metrics (CPU & memory)</li>
                                <li>Logs (read-only)</li>
                            </ul>
                            <p className="text-gray-600">
                                No manual configuration is required. After login, the dashboard loads
                                real-time cluster data automatically for visual inspection.
                            </p>
                        </div>
                    </section>


                    {/* ================= LOGIN ================= */}
                    <section id="login" className="space-y-6">
                        <h2 className="text-2xl font-semibold">Login & Access</h2>

                        <p className="text-gray-600">
                            VIEWER uses secure authentication to ensure that only authorized users can
                            access cluster inspection features. This protects sensitive infrastructure
                            data while maintaining a simple login experience for developers.
                        </p>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">User Authentication</h3>
                            <p className="text-gray-600">
                                Users can log in using their registered credentials. Once authenticated,
                                a secure session is created and maintained throughout the application.
                                All requests to the backend are validated to ensure data is accessed
                                safely in read-only mode.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Automatic Dashboard Access</h3>
                            <p className="text-gray-600">
                                After successful login, users are automatically redirected to the
                                dashboard. VIEWER immediately connects to the active Kubernetes context
                                and loads cluster data without requiring any manual setup.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Session-Based Access Control</h3>
                            <p className="text-gray-600">
                                Access to dashboard features remains active while the user is logged in.
                                Logging out immediately clears the session and prevents unauthorized
                                access to cluster data.
                            </p>
                        </div>

                        <p className="text-gray-600">
                            This streamlined login flow ensures that users can move from authentication
                            to cluster inspection in seconds, without configuration overhead.
                        </p>
                    </section>

                    {/* ================= DASHBOARD ================= */}
                    <section id="dashboard" className="space-y-6">
                        <h2 className="text-2xl font-semibold">Dashboard Overview</h2>

                        <p className="text-gray-600">
                            The VIEWER dashboard serves as the central control panel for inspecting your
                            Kubernetes cluster. It provides a unified, visual overview of all critical
                            resources and their current state, allowing users to understand cluster
                            behavior at a glance.
                        </p>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Cluster Resources</h3>
                            <p className="text-gray-600">
                                The dashboard displays key Kubernetes objects including nodes, pods,
                                deployments, namespaces, jobs, and services. Each resource is presented in
                                a structured, visual format that eliminates the need for manual
                                <code className="mx-1 px-1 bg-gray-100 rounded">kubectl</code> commands.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Health & Status Monitoring</h3>
                            <p className="text-gray-600">
                                Resource health is highlighted using clear visual indicators. Users can
                                quickly identify failed pods, restarting containers, pending workloads,
                                or unavailable nodes without searching through logs or YAML files.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Metrics Visualization</h3>
                            <p className="text-gray-600">
                                CPU and memory usage metrics are visualized using charts and graphs to help
                                detect performance issues, resource bottlenecks, and abnormal usage
                                patterns. This makes it easier to diagnose problems before they affect
                                application stability.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Unified Inspection Experience</h3>
                            <p className="text-gray-600">
                                By combining resource inspection, health monitoring, and metrics
                                visualization in one place, VIEWER removes the need to switch between
                                multiple tools such as dashboards, CLI commands, and monitoring systems.
                            </p>
                        </div>

                        <p className="text-gray-600">
                            The dashboard operates in read-only mode, ensuring that users can safely
                            inspect production and development clusters without the risk of accidental
                            changes.
                        </p>
                    </section>

                    {/* ================= AI ASSISTANT ================= */}
                    <section id="ai" className="space-y-6">
                        <h2 className="text-2xl font-semibold">AI Assistant</h2>

                        <p className="text-gray-600">
                            The AI Assistant is a core feature of VIEWER that enables users to interact
                            with their Kubernetes cluster using natural language instead of complex CLI
                            commands. It bridges the gap between infrastructure data and human
                            understanding by translating raw cluster information into clear explanations.
                        </p>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Natural Language Queries</h3>
                            <p className="text-gray-600">
                                Users can ask questions in plain English such as:
                            </p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1">
                                <li>Which pods are restarting?</li>
                                <li>Why is memory usage high?</li>
                                <li>Show namespaces with active workloads</li>
                                <li>Which nodes are under pressure?</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Intelligent Cluster Analysis</h3>
                            <p className="text-gray-600">
                                The AI Assistant analyzes live cluster data, logs, and metrics to generate
                                meaningful explanations instead of raw outputs. This allows users to
                                quickly understand problems without deep Kubernetes expertise.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Safe, Read-Only Operation</h3>
                            <p className="text-gray-600">
                                All AI responses are generated in read-only mode. The assistant never
                                applies changes or executes commands that could modify cluster state,
                                making it safe for production and learning environments.
                            </p>
                        </div>

                        <p className="text-gray-600">
                            By combining artificial intelligence with visual inspection, VIEWER helps
                            developers troubleshoot faster, learn Kubernetes concepts intuitively, and
                            gain confidence in understanding cluster behavior.
                        </p>
                    </section>

                    {/* ================= SECURITY ================= */}
                    <section id="security" className="space-y-6">
                        <h2 className="text-2xl font-semibold">Security Model</h2>

                        <p className="text-gray-600">
                            Security is a core design principle of VIEWER. The platform is intentionally
                            built to operate in a safe, non-destructive manner so that users can inspect
                            Kubernetes clusters without the risk of accidental changes.
                        </p>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Read-Only Architecture</h3>
                            <p className="text-gray-600">
                                VIEWER operates strictly in read-only mode. It does not apply
                                configurations, delete resources, restart workloads, or execute commands
                                that modify cluster state. All interactions are limited to data retrieval
                                and visualization.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Safe for Production Clusters</h3>
                            <p className="text-gray-600">
                                Because VIEWER never performs write operations, it can be safely connected
                                to production environments. This allows teams to monitor and understand
                                cluster behavior without introducing operational risk.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Secure Data Access</h3>
                            <p className="text-gray-600">
                                All requests to the backend are authenticated and validated. VIEWER only
                                reads data using the current Kubernetes context and respects existing
                                access controls defined in kubeconfig and RBAC policies.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Ideal for Learning & Education</h3>
                            <p className="text-gray-600">
                                The read-only security model makes VIEWER ideal for students, beginners,
                                and training environments where safe exploration of Kubernetes is required
                                without the fear of breaking cluster resources.
                            </p>
                        </div>

                        <p className="text-gray-600">
                            This security-first design ensures that VIEWER provides deep visibility into
                            Kubernetes environments while maintaining the highest level of operational
                            safety.
                        </p>
                    </section>

                </main>

            </div>

            {/* FOOTER */}
            <Footer />
        </div>
    );
}
