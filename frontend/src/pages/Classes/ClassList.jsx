import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { School, Users } from "lucide-react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";

export default function ClassList() {
  const [classes, setClasses] = useState(null);

  useEffect(() => {
    api.get("/api/classes").then((res) => setClasses(res.data));
  }, []);

  if (!classes) return <Loader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
        <p className="text-sm text-gray-400">{classes.length} classes • Al-Maarif Education</p>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {classes.map((c) => (
          <Link key={c.name} to={`/classes/${c.name}`} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center">
                <School size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Class {c.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1"><Users size={12}/> {c.totalStudents} students</p>
              </div>
            </div>
            {c.classTeacher && <p className="text-xs text-gray-400 mt-3">Class Teacher: <span className="text-gray-600 font-medium">{c.classTeacher}</span></p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
