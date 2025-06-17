<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - QuickPick</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            background-color: #f8f9fa;
        }
        .sidebar {
            height: 100vh;
            background-color: #fff;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        }
        .sidebar .nav-link {
            color: #6c757d;
        }
        .sidebar .nav-link.active {
            background-color: #e9ecef;
            color: #000;
        }
        .card {
            border: none;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .popular-product img {
            width: 100%;
            height: 100px;
            object-fit: cover;
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="d-flex">
        <!-- Sidebar -->
        <div class="sidebar p-3">
            <div class="mb-4">
                <h4>QuickPick</h4>
            </div>
            <ul class="nav flex-column">
                <li class="nav-item">
                    <a class="nav-link active" href="{{ route('admin.dashboard') }}">Dashboard</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Categories</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Products</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Orders</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Users</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Promotions</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Reports</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">Settings</a>
                </li>
                <li class="nav-item mt-auto">
                    <form method="POST" action="{{ route('admin.logout') }}">
                        @csrf
                        <button type="submit" class="nav-link btn btn-link">Logout</button>
                    </form>
                </li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="flex-grow-1 p-4">
            <h2>Dashboard Overview</h2>

            <!-- Stats -->
            <div class="row mb-4">
                <div class="col-md-4">
                    <div class="card p-3">
                        <h5>Total Orders</h5>
                        <h3>{{ number_format($totalOrders) }}</h3>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3">
                        <h5>Total Revenue</h5>
                        <h3>${{ number_format($totalRevenue) }}</h3>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card p-3">
                        <h5>Active Users</h5>
                        <h3>{{ number_format($activeUsers) }}</h3>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="card p-3 mb-4">
                <h5>Recent Activity</h5>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Order Date</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($recentActivity as $activity)
                            <tr>
                                <td>{{ $activity['order_id'] }}</td>
                                <td>{{ $activity['customer'] }}</td>
                                <td>{{ $activity['order_date'] }}</td>
                                <td>{{ $activity['status'] }}</td>
                                <td>${{ $activity['total'] }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>

            <!-- Sales Trends -->
            <div class="card p-3 mb-4">
                <h5>Sales Trends</h5>
                <div class="d-flex align-items-center mb-3">
                    <h3 class="me-3">Monthly Sales: ${{ number_format($monthlySales) }}</h3>
                    <span class="text-success">This Month +12%</span>
                </div>
                <canvas id="salesChart"></canvas>
            </div>

            <!-- Popular Products -->
            <div class="card p-3">
                <h5>Popular Products</h5>
                <div class="row">
                    @foreach ($popularProducts as $product)
                        <div class="col-md-3">
                            <div class="popular-product text-center">
                                <img src="{{ $product['image'] }}" alt="{{ $product['name'] }}" />
                                <p>{{ $product['name'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Chart.js Script for Sales Trends -->
    <script>
        const ctx = document.getElementById('salesChart').getContext('2d');
        const salesData = {!! json_encode($salesTrends) !!};
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
                datasets: [{
                    label: 'Sales',
                    data: salesData,
                    borderColor: '#28a745',
                    fill: false,
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    </script>
</body>
</html>
