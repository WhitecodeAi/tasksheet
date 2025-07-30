import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  ButtonGroup,
  CircularProgress,
  Stack,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import { api } from "../utils/api";
const TasksheetEntriesDisplay = forwardRef(({ userId }, ref) => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterRange, setFilterRange] = useState("TODAY");

  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);

  const fetchEntries = async () => {
    setIsLoading(true); // start loader
    try {
      const res = await api.get(
        `/api/tasksheetEntries/user/${userId}`
      );

      const sortedEntries = res.data
        .map((entry) => ({
          ...entry,
          entry_date: dayjs(entry.entry_date).format("YYYY-MM-DDTHH:mm:ss"), // force ISO format
          created_at: dayjs(entry.created_at), // used for sorting and display
        }))
        .sort((a, b) => b.created_at.valueOf() - a.created_at.valueOf()); // sort by true creation time

      setEntries(sortedEntries);
    } catch (err) {
      console.error("Failed to fetch tasksheet entries", err);
    } finally {
      setIsLoading(false); // stop loader
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshEntries: fetchEntries,
  }));

  const fetchReferenceData = async () => {
    try {
      const [projectRes, categoryRes] = await Promise.all([
        api.get("/api/projects"),
        api.get("/api/taskCategories"),
      ]);
      setProjects(projectRes.data);
      setTaskCategories(categoryRes.data);
    } catch (error) {
      console.error("Error fetching reference data:", error);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  const applyDateFilter = (rangeLabel) => {
    setFilterRange(rangeLabel);
  };
  const getProjectName = (id) => {
    const project = projects.find((p) => String(p.id) === String(id));
    return project ? project.name : `Unknown (${id})`;
  };

  const getCategoryName = (id) => {
    const category = taskCategories.find((c) => String(c.id) === String(id));
    return category ? category.name : `Unknown (${id})`;
  };

  const getFilteredEntries = () => {
    const now = dayjs();
    let filtered = [];

    switch (filterRange) {
      case "TODAY":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isSame(now, "day")
        );
        break;
      case "WEEK":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(7, "day"))
        );
        break;
      case "MONTH":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(1, "month"))
        );
        break;
      case "3MONTH":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(3, "month"))
        );
        break;
      case "6MONTH":
        filtered = entries.filter((e) =>
          dayjs(e.entry_date).isAfter(now.subtract(6, "month"))
        );
        break;
      default:
        filtered = [...entries];
        break;
    }

    // 🔁 Sort by entry_date descending
    return filtered.sort(
      (a, b) => dayjs(b.entry_date).valueOf() - dayjs(a.entry_date).valueOf()
    );
  };

  return (
    <>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Tasksheet Entries
        </Typography>

        <Stack direction="row" spacing={1} mb={2}>
          {[
            { label: "Today", value: "TODAY" },
            { label: "This Week", value: "WEEK" },
            { label: "This Month", value: "MONTH" },
            //{ label: 'Last 3 Months', value: '3MONTH' },
            // { label: 'Last 6 Months', value: '6MONTH' },
            { label: "All", value: "ALL" },
          ].map(({ label, value }) => (
            <Button
              key={value}
              onClick={() => applyDateFilter(value)}
              variant={filterRange === value ? "contained" : "outlined"}
              color={filterRange === value ? "primary" : "inherit"}
            >
              {label}
            </Button>
          ))}
        </Stack>

        {isLoading ? (
          <Typography variant="body1" sx={{ textAlign: "center" }}>
            <CircularProgress /> Loading entries...
          </Typography>
        ) : entries.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No entries found for this period.
          </Typography>
        ) : (
          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Project Name</TableCell>
                  <TableCell>Task Category</TableCell>
                  <TableCell>Task Name</TableCell>
                  <TableCell>Total Efforts</TableCell>
                  <TableCell>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredEntries().map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      {dayjs(entry.entry_date).format("DD MMM YYYY")}
                    </TableCell>
                    <TableCell>{getProjectName(entry.project_id)}</TableCell>
                    <TableCell>
                      {getCategoryName(entry.task_category_id)}
                    </TableCell>
                    <TableCell>{entry.task_name}</TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {Math.floor(entry.hours)}:
                        {entry.minutes.toString().padStart(2, "0")}
                      </Typography>
                    </TableCell>
                    <TableCell>{entry.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
});

export default TasksheetEntriesDisplay;
