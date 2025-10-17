
const actions = ["create", "view", "update", "delete"];
const resources = ["course", "review", "user", "assignment", "enrollment", "submission", "attendance", "grade"];

const roles = {
    admin: {
        course: { create: true, view: true, update: "all", delete: "all" },
        review: { delete: "all"},
        user: { create: true, view: "all", delete: "all", update: "own" },
        enrollment: { view: "all" },
        assignment: {create: true, view: "all", update: "all", delete: "all" },
        submission: { create: false, view: "all", delete: "all" },
        attendance: { create: true, view: "all", update: "all" },
        grade: { create: "all", view: "all", update: "all", delete: "all" }
    },
    teacher: {
        course: { create: true, view: true, update: "own", delete: "own" },
        review: { delete: "own"},
        user: { view: "own", delete: "own", update: "team" },
        enrollment: { view: "all" },
        assignment: {create: true, view: "team", update: "team", delete: "team"},
        submission: { create: false, view: "team" },
        attendance: { create: true, view: "all", update: "team" },
        grade: { create: "team", view: "team", update: "team", delete: "team" }
    },
    student: {
        course: { view: true },
        review: { delete: "own"},
        user: { view: "own", delete: "own", update: "own" },
        enrollment: {create: true, view: "own"},
        assignment: {view: "own"},
        submission: { create: true, view: "own", delete: "own" },
        attendance: { view: "own" },
        grade: { view: "own" }
    }
}

module.exports = {
    actions,
    resources,
    roles
};