import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { queryAnalytics } from "@/queries/admin"
import { queryUserId } from "@/queries/auth"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react";
import WorldMap from "react-svg-worldmap";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Analytics() {
    const { data: userId } = useQuery(queryUserId())
    const { data: analyticsData, isFetched: queryFetched } = useQuery({ ...queryAnalytics(userId), enabled: !!userId })

    const [usValue, setUsValue] = useState(0)

    useEffect(() => {
        if (queryFetched && analyticsData) {
            for (let row of analyticsData.data.data.people) {
                if (row[0] == "United States") {
                    setUsValue(prevCount => prevCount + 1)
                }
            }
        }
    }, [queryFetched])

    const data = [
        { country: "us", value: usValue }
    ];

    const sortedBuckets = useMemo(() => {
        if (queryFetched && analyticsData) {
            return [...analyticsData.data.data.buckets]
                .sort((a, b) => {
                    if (a.year === b.year) return a.month - b.month
                    return a.year - b.year
                })
                .map(row => ({
                    ...row,
                    label: `${row.month}/${row.year}`
                }))
        }
    }, [queryFetched])

    // Total users (latest month snapshot)
    const totalUsers = useMemo(() => {
        if (!sortedBuckets) return 0
        const latest = sortedBuckets[sortedBuckets.length - 1]
        return (
            latest.negative +
            latest.six_under +
            latest.six +
            latest.seven +
            latest.eight +
            latest.nine +
            latest.ten +
            latest.ten_above
        )
    }, [sortedBuckets])

    const barData = useMemo(() => {
        if (!sortedBuckets) return [0, 0, 0, 0, 0, 0, 0, 0]

        const latest = sortedBuckets[sortedBuckets.length - 1]

        return [
            { name: "Negative", value: latest.negative },
            { name: "Under 100k", value: latest.six_under },
            { name: "100k to 1m", value: latest.six },
            { name: "1m to 10m", value: latest.seven },
            { name: "10m to 100m", value: latest.eight },
            { name: "100m to 1b", value: latest.nine },
            { name: "1b to 10b", value: latest.ten },
            { name: "10b+", value: latest.ten_above },
        ]
    }, [sortedBuckets])


    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                    Admin Insights Dashboard
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    This page provides aggregated, platform-wide insights across all users.
                    These analytics help monitor growth, financial distribution trends,
                    and behavioral shifts over time.
                </p>
            </div>

            {/* Total Users Card */}
            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        Total Active Users (Latest Snapshot)
                    </CardDescription>
                    <CardTitle className="text-4xl font-bold">
                        {totalUsers.toLocaleString()} Users
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Calculated from the most recent monthly aggregation.
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        See how users are distributed around the world
                    </CardTitle>
                </CardHeader>
                <CardContent className="items-center">
                    <WorldMap
                        color="red"
                        value-suffix="people"
                        data={data}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Current Wealth Distribution</CardTitle>
                    <CardDescription>
                        Snapshot of all user buckets for the most recent month.
                        This reflects the current distribution across the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Line Chart - Trend Over Time */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        User Distribution Trends
                    </CardTitle>
                    <CardDescription>
                        Month-over-month changes across financial buckets.
                        Each line represents a wealth tier.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sortedBuckets}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" name="negative" dataKey="Negative" />
                            <Line type="monotone" name="Under 100k" dataKey="six_under" />
                            <Line type="monotone" name="100k to 1m" dataKey="six" />
                            <Line type="monotone" name="1m to 10m" dataKey="seven" />
                            <Line type="monotone" name="10m to 100m" dataKey="eight" />
                            <Line type="monotone" name="100m to 1b" dataKey="nine" />
                            <Line type="monotone" name="1b to 10b" dataKey="ten" />
                            <Line type="monotone" name="10b+" dataKey="ten_above" />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Stacked Area Chart - Composition */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribution Composition</CardTitle>
                    <CardDescription>
                        Stacked representation showing how overall user distribution
                        shifts across wealth tiers over time.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sortedBuckets}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="negative" stackId="1" />
                            <Area type="monotone" dataKey="six_under" stackId="1" />
                            <Area type="monotone" dataKey="six" stackId="1" />
                            <Area type="monotone" dataKey="seven" stackId="1" />
                            <Area type="monotone" dataKey="eight" stackId="1" />
                            <Area type="monotone" dataKey="nine" stackId="1" />
                            <Area type="monotone" dataKey="ten" stackId="1" />
                            <Area type="monotone" dataKey="ten_above" stackId="1" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

        </div>
    )
}