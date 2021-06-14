drop table if exists assignment_grades;

drop table if exists assignment_solution;

drop table if exists assignment;

drop table if exists grade;

drop table if exists school_class;

drop table if exists student;

drop table if exists subject;

drop table if exists teacher;

drop table if exists account;


create or replace table account
(
    ID            int auto_increment primary key,
    email         varchar(256)                         not null,
    pass          varchar(256)                         not null,
    first_name    varchar(128)                         not null,
    last_name     varchar(128)                         not null,
    date_created  datetime default current_timestamp() not null,
    date_modified datetime default current_timestamp() not null,
    constraint IndexEmail unique (email)
);
create or replace table teacher
(
    ID         int auto_increment primary key,
    account_ID int not null,
    constraint AccountTeacherValid foreign key (account_ID) references account (ID)
        on delete cascade

);
create or replace table student
(
    ID         int auto_increment primary key,
    account_ID int not null,
    constraint AccountStudentValid foreign key (account_ID) references account (ID)
        on delete cascade
);
create or replace table subject
(
    ID         int auto_increment primary key,
    name       varchar(256) not null,
    teacher_ID int          not null,
    constraint ValidTeacher foreign key (teacher_ID) references account (ID)
        on delete cascade
);
create or replace table school_class
(
    ID         int auto_increment primary key,
    name       varchar(256) not null,
    subject_ID int          not null,
    date_created datetime default now() not null,
    constraint IndexName unique (name),
    constraint ValidSubject foreign key (subject_ID) references subject (ID)
        on delete cascade
);
create or replace table grade
(
    ID              int auto_increment primary key,
    student_ID      int                                  not null,
    school_class_ID int                                  not null,
    value           int                                  not null,
    date_created    datetime default now() not null,
    constraint ValidStudentIDOnGrade foreign key (student_ID) references student (ID) on delete cascade,
    constraint ValidSchoolClassIDOnGrade foreign key (school_class_ID) references school_class (ID) on delete cascade
);
create or replace table assignment
(
    ID              int auto_increment primary key,
    school_class_ID int                                  not null,
    date_created    datetime default now() not null,
    task            longtext                             not null
);
create or replace table assignment_solution
(
    ID            int auto_increment primary key,
    assignment_ID int          not null,
    file_name     varchar(256) not null,
    student_ID    int          not null,
    constraint ValidStudentIDOnSolution foreign key (student_ID) references student (ID),
    constraint ValidAssignmentIDOnSolution foreign key (assignment_ID) references assignment (ID)
);

create or replace table assignment_grades
(
    ID            int auto_increment primary key,
    assignment_ID int not null,
    grade_ID      int not null,
    constraint ValidGradeIDOnAssignment foreign key (grade_ID) references grade (ID) on delete cascade,
    constraint ValidAssignmentOnAssignment foreign key (assignment_ID) references assignment (ID) on delete cascade
);

create or replace
    definer = root@localhost procedure Account_Add(IN in_email varchar(256), IN in_pass varchar(256),
                                                   IN in_first_name varchar(128), IN in_last_name varchar(128),
                                                   IN in_account_type varchar(128)) modifies sql data
begin
    declare v_account_ID integer;
    set v_account_ID = -1;

    select ID into v_account_ID from Account where Account.email = in_email limit 1;

    if v_account_ID != -1 then
        signal sqlstate '45000' set message_text = '$Duplicate Account$';
    end if;

    insert into Account (email, pass, first_name, last_name)
    values (in_email, in_pass, in_first_name, in_last_name);

    set v_account_ID = last_insert_id();

    if in_account_type = 'teacher' then
        insert into Teacher (account_ID) values (v_account_ID);
    else
        if in_account_type = 'student' then
            insert into Student (account_ID) values (v_account_ID);
        else
            signal sqlstate '45000' set message_text = '$Unidentified Account Type$';
        end if;
    end if;
    select v_account_ID    as ID,
           in_email        as email,
           in_first_name   as first_name,
           in_last_name    as last_name,
           in_account_type as account_type;
end;


create or replace
    definer = root@localhost procedure Account_Login(IN in_email varchar(256), IN in_pass varchar(256))
begin
    declare v_account_ID integer;
    declare v_validCredentials integer;

    declare v_IsTeacher int;
    declare v_IsStudent int;
    declare v_firstName varchar(128);
    declare v_lastName varchar(128);

    declare v_account_type varchar(128);

    set v_account_ID = -1;

    select ID into v_account_ID from Account where Account.email = in_email limit 1;
    if v_account_ID = -1 then
        signal sqlstate '45000' set message_text = '$Nonexistent account$';
    end if;

    select COUNT(*) into v_validCredentials from account where account.email = in_email and account.pass = in_pass;

    if 0 = v_validCredentials then
        signal sqlstate '45000' set message_text = '$Invalid credentials$';
    end if;

    select first_name into v_firstName from account where account.email = in_email and account.pass = in_pass limit 1;
    select last_name into v_lastName from account where account.email = in_email and account.pass = in_pass limit 1;

    select COUNT(*) into v_IsTeacher from teacher where teacher.account_ID = v_account_ID;
    select COUNT(*) into v_IsStudent from student where student.account_ID = v_account_ID;

    set v_account_type = 'invalid';
    if v_IsTeacher = 1 then
        set v_account_type = 'teacher';
    else if v_IsStudent = 1 then
        set v_account_type = 'student';
    end if;
    end if;

    SELECT v_account_type as account_type,
           v_firstName as first_name,
           v_lastName  as last_name,
           in_email    as email,
           v_account_ID as ID;

end;

