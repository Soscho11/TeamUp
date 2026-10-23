import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { projectService } from '../../services/projectService';
import ProjectCard from '../../components/projects/ProjectCard';
import SearchBar from '../../components/common/SearchBar';
import FilterPanel from '../../components/common/FilterPanel';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & filter state initialized from URL search params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [skill, setSkill] = useState(searchParams.get('skill') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'created_at');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await projectService.getProjects({
        search,
        category,
        status,
        skill,
        sortBy,
        page,
        limit: 9,
      });
      setProjects(data.projects || []);
      setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    } catch (err) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // Sync state to URL and fetch
  useEffect(() => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (status) params.status = status;
    if (skill) params.skill = skill;
    if (sortBy !== 'created_at') params.sortBy = sortBy;
    if (page > 1) params.page = page;

    setSearchParams(params, { replace: true });
    fetchProjects();
  }, [search, category, status, skill, sortBy, page]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setStatus('');
    setSkill('');
    setSortBy('created_at');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || category || status || skill || sortBy !== 'created_at');

  return (
    <div className="container" style={{ padding: '2.5rem 1rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Explore Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Discover student projects, open collaborations, and hackathon teams.
          </p>
        </div>

        <Link to="/projects/create" className="btn btn-primary">
          <PlusCircle size={16} />
          <span>Create Project</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          onClear={() => {
            setSearch('');
            setPage(1);
          }}
        />

        <FilterPanel
          category={category}
          onCategoryChange={(cat) => {
            setCategory(cat);
            setPage(1);
          }}
          status={status}
          onStatusChange={(st) => {
            setStatus(st);
            setPage(1);
          }}
          skill={skill}
          onSkillChange={(sk) => {
            setSkill(sk);
            setPage(1);
          }}
          sortBy={sortBy}
          onSortChange={(sb) => {
            setSortBy(sb);
            setPage(1);
          }}
          onReset={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {/* Results Header */}
      {!loading && !error && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-subtle)',
            marginBottom: '1.25rem',
          }}
        >
          <span>Showing {projects.length} of {pagination.total} project{pagination.total === 1 ? '' : 's'}</span>
          {hasActiveFilters && <span>Filtered results</span>}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <SkeletonLoader type="card" count={6} />
      ) : error ? (
        <ErrorState title="Error Loading Projects" message={error} onRetry={fetchProjects} />
      ) : projects.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No matching projects found"
            description="Try adjusting your keywords, selecting different categories, or clearing active filters."
            actionText={hasActiveFilters ? 'Clear Filters' : 'Create First Project'}
            actionLink={hasActiveFilters ? undefined : '/projects/create'}
            onAction={hasActiveFilters ? handleResetFilters : undefined}
          />
        </div>
      ) : (
        <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '2rem',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0 0.75rem' }}>
            Page {page} of {pagination.totalPages}
          </span>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
            disabled={page >= pagination.totalPages}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

