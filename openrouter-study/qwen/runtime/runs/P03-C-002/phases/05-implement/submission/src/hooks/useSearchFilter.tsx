
export const useSearchFilter = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [assigneeFilter, setAssigneeFilter] = React.useState("all");
  const [filteredTasks, setFilteredTasks] = React.useState([]);
  
  const normalize = (input) => input?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  
  const filterTasks = (tasks) => {
    let result = [...tasks];
    
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    
    if (assigneeFilter !== "all") {
      result = result.filter(t => t.assignee === assigneeFilter);
    }
    
    if (searchQuery.trim()) {
      const words = searchQuery.split(/\s+/).filter(w => w.trim());
      result = result.filter(t => {
        const searchable = [t.id, t.title, t.description, t.assignee].join("").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
        return words.every(word => searchable.includes(word.toLowerCase()));
      });
    }
    
    setFilteredTasks(result);
    return result;
  };
  
  return { searchQuery, setSearchQuery, statusFilter, setStatusFilter, assigneeFilter, setAssigneeFilter, filteredTasks };
};

