console.log("Recent Employees Loaded");

const employees = [
{
name:"Emma Wilson",
role:"HR Executive",
avatar:"EW"
},

{
name:"James Brown",
role:"Developer",
avatar:"JB"
},

{
name:"Sophia Lee",
role:"UI Designer",
avatar:"SL"
},

{
name:"Alex Parker",
role:"Finance",
avatar:"AP"
}
];

const list = document.querySelector(".employee-list");
employees.forEach(emp=>{
list.innerHTML +=
`
<div class="employee-item">
<div class="employee-avatar">
${emp.avatar}
</div>

<div class="employee-info">
    <h4>${emp.name}</h4>
    <p>${emp.role}</p>
</div>
</div>
`;
});