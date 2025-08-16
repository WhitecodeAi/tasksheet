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
  Button,
  ButtonGroup,
  CircularProgress,
  Stack,
  Snackbar,
  Alert
} from "@mui/material";
import dayjs from "dayjs";
import { api } from "../utils/api";

const TasksheetEntriesDisplay = forwardRef(({ userId, onEdit, onDeleteSuccess, searchQuery = '', filterRange = 'TODAY' }, ref) => {

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // filterRange is now passed as prop
  const [projects, setProjects] = useState([]);
  const [taskCategories, setTaskCategories] = useState([]);
const [showToast, setShowToast] = useState(false);
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/api/tasksheetEntries/user/${userId}`);
      const sortedEntries = res.data
        .map((entry) => ({
          ...entry,
          entry_date: dayjs(entry.entry_date).format("YYYY-MM-DDTHH:mm:ss"),
          created_at: dayjs(entry.created_at),
        }))
        .sort((a, b) => b.created_at.valueOf() - a.created_at.valueOf());
      setEntries(sortedEntries);
    } catch (err) {
      console.error("Failed to fetch tasksheet entries", err);
    } finally {
      setIsLoading(false);
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

  // applyDateFilter is now handled by parent component

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

    // First apply date filter
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

    // Then apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry) => {
        const projectName = getProjectName(entry.project_id).toLowerCase();
        const categoryName = getCategoryName(entry.task_category_id).toLowerCase();
        const taskName = (entry.task_name || '').toLowerCase();
        const comments = (entry.comments || '').toLowerCase();

        return (
          projectName.includes(query) ||
          categoryName.includes(query) ||
          taskName.includes(query) ||
          comments.includes(query)
        );
      });
    }

    return filtered.sort(
      (a, b) => dayjs(b.entry_date).valueOf() - dayjs(a.entry_date).valueOf()
    );
  };

  const handleEdit = (entry) => {
  if (onEdit) {
    onEdit(entry); // delegate to parent
  }
};


  const handleDelete = async (entry) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the entry dated ${dayjs(entry.entry_date).format("DD MMM YYYY")}?`
    );
    if (!confirmed) return;

    try {
      await api.delete(`/api/tasksheetEntries/${entry.id}`);
      await fetchEntries(); // refresh grid
      if (onDeleteSuccess) {
        onDeleteSuccess(); // notify parent
      } else {
        setShowToast(true); // fallback to local toast
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  return (
    <>

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
                <TableCell>Task Details</TableCell>
                <TableCell>Total Efforts</TableCell>
                <TableCell>Comments</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredEntries().map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {dayjs(entry.entry_date).format("DD MMM YYYY")}
                  </TableCell>
                  <TableCell>{getProjectName(entry.project_id)}</TableCell>
                  <TableCell>{getCategoryName(entry.task_category_id)}</TableCell>
                  <TableCell style={{ whiteSpace: "pre-line" }}>
                    {entry.task_name}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1">
                      {Math.floor(entry.hours)}:
                      {entry.minutes.toString().padStart(2, "0")}
                    </Typography>
                  </TableCell>
                  <TableCell>{entry.comments}</TableCell>
                  <TableCell align="center">
                    <ButtonGroup variant="text" size="small">
                      <Button onClick={() => handleEdit(entry)}>Edit</Button>
                      <Button color="error" onClick={() => handleDelete(entry)}>
                        Delete
                      </Button>
                    </ButtonGroup>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
  open={showToast}
  autoHideDuration={3000}
  onClose={() => setShowToast(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
>
  <Alert onClose={() => setShowToast(false)} severity="success" sx={{ width: '100%' }}>
    Deleted Successfully
  </Alert>
</Snackbar>
    </>
  );
});

export default TasksheetEntriesDisplay;
