drop table if exists assignment_grades cascade;

drop table if exists assignment_solution cascade;

drop table if exists assignment cascade;

drop table if exists class_student_association cascade;

drop table if exists grade cascade;

drop table if exists school_class cascade;

drop table if exists student cascade;

drop table if exists student_school_class_state cascade;

drop table if exists subject cascade;

drop table if exists teacher cascade;

drop table if exists account cascade;




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
    ID          int auto_increment primary key,
    name        varchar(256) not null,
    teacher_ID  int          not null,
    description varchar(1024),
    constraint ValidTeacher foreign key (teacher_ID) references account (ID)
        on delete cascade,
    constraint SubjectNameUniqueForTeacher unique (name, teacher_ID)
);
create or replace table school_class
(
    ID           int auto_increment primary key,
    name         varchar(256)           not null,
    subject_ID   int                    not null,
    date_created datetime default now() not null,
    constraint IndexName unique (name),
    constraint ValidSubject foreign key (subject_ID) references subject (ID)
        on delete cascade
);
alter table school_class
    add column class_year int GENERATED ALWAYS AS (year(school_class.date_created));
create or replace trigger SchoolClass_TriggerUniqueYear
    before insert
    on school_class
    for each row
begin
    declare v_exists_same_year int;
    declare v_insert_year int;

    set v_exists_same_year = 0;
    set v_insert_year = year(new.date_created);

    SELECT COUNT(*)
    into v_exists_same_year
    from school_class
    where name = new.name
      and subject_ID = new.subject_ID
      and class_year = v_insert_year;

    if v_exists_same_year > 0 then
        signal sqlstate '45000' set message_text =
                '$School class of given name and subject already exists for given year$';
    end if;
end;

create or replace table grade
(
    ID              int auto_increment primary key,
    student_ID      int                    not null,
    school_class_ID int                    not null,
    score_current   int                    not null,
    score_ceiling   int      default 10    not null,
    date_created    datetime default now() not null,
    teacher_comment varchar(256),
    constraint ValidStudentIDOnGrade foreign key (student_ID) references student (ID) on delete cascade,
    constraint ValidSchoolClassIDOnGrade foreign key (school_class_ID) references school_class (ID) on delete cascade
);
create or replace table assignment
(
    ID              int auto_increment primary key,
    school_class_ID int                    not null,
    date_created    datetime default now() not null,
    task            longtext               not null,
    constraint ValidSchoolClass foreign key (school_class_ID) references school_class (ID) on delete cascade
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
    constraint ValidAssignmentOnAssignment foreign key (assignment_ID) references assignment (ID) on delete cascade,
    constraint SingleGradeOnAssignment unique (assignment_ID, grade_ID)
);
create or replace table student_school_class_state
(
    ID    int auto_increment primary key,
    state varchar(64) not null,
    constraint UniqueState unique (state)
);
insert into student_school_class_state (state)
values ('accepted'),
       ('denied');

create or replace table class_student_association
(
    ID                  int auto_increment primary key,
    student_ID          int not null,
    school_class_ID     int not null,
    student_class_state int not null,
    constraint ValidStudentInClass foreign key (student_ID) references student (ID),
    constraint ValidSC foreign key (school_class_ID) references school_class (ID),
    constraint ValidStudentState foreign key (student_class_state) references student_school_class_state (ID),
    constraint UniqueStateForStudent unique (student_ID, school_class_ID)
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
    else
        if v_IsStudent = 1 then
            set v_account_type = 'student';
        end if;
    end if;

    SELECT v_account_type as account_type,
           v_firstName    as first_name,
           v_lastName     as last_name,
           in_email       as email,
           v_account_ID   as ID;

end;
create or replace
    definer = root@localhost procedure Subject_FindByTeacherAccID(IN in_acc_id int)
begin
    declare v_teacher_ID int;
    set v_teacher_ID = -1;

    select ID into v_teacher_ID from teacher where account_ID = in_acc_id limit 1;

    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account id$';
    end if;

    select * from subject where subject.teacher_ID = v_teacher_ID;

end;

create or replace
    definer = root@localhost procedure Subject_Add(IN in_acc_id int, IN in_name varchar(256),
                                                   IN in_description varchar(1024)) modifies sql data
begin
    declare v_teacher_ID integer;
    set v_teacher_ID = -1;

    select ID into v_teacher_ID from teacher where account_ID = in_acc_id limit 1;

    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account id$';
    end if;

    insert into subject (name, teacher_ID, description) VALUES (in_name, v_teacher_ID, in_description);
    select last_insert_id() as ID;
end;

create or replace
    definer = root@localhost procedure SchoolClass_Add(IN in_acc_id int, IN in_subject_name varchar(256),
                                                       IN in_school_class_name varchar(1024)) modifies sql data
begin
    declare v_teacher_ID integer default -1;
    declare v_subject_ID integer default -1;

    select ID into v_teacher_ID from teacher where account_ID = in_acc_id limit 1;

    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account id$';
    end if;

    select ID into v_subject_ID from subject where teacher_ID = v_teacher_ID and subject.name = in_subject_name limit 1;

    if v_subject_ID = -1 then
        signal sqlstate '45000' set message_text = '$Nonexistent subject name for given teacher$';
    end if;

    insert into school_class (name, subject_ID) VALUES (in_school_class_name, v_subject_ID);

    select last_insert_id() as school_class_ID;
end;

create or replace
    definer = root@localhost procedure SchoolClass_GetSchoolClassByTeachersSubject(IN in_acc_id int, IN in_subject_name varchar(256))
    reads sql data
begin
    declare v_teacher_ID integer;
    declare v_subject_ID integer;

    set v_teacher_ID = -1;

    select ID into v_teacher_ID from teacher where account_ID = in_acc_id limit 1;

    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account id$';
    end if;

    select ID into v_subject_ID from subject where teacher_ID = v_teacher_ID and subject.name = in_subject_name limit 1;

    if v_subject_ID = -1 then
        signal sqlstate '45000' set message_text = '$Nonexistent subject name for given teacher$';
    end if;

    select * from school_class where school_class.subject_ID = v_subject_ID;

end;

create or replace
    definer = root@localhost procedure SchoolClass_AddStudent(IN in_student_id int, IN in_sc_id int)
begin
    declare v_exists_student integer default 0;
    declare v_exists_sc integer default 0;
    declare v_stud_id integer default 0;
    declare v_student_existent_to_class integer default 0;

    select count(*) into v_exists_student from student where account_ID = in_student_id;
    if v_exists_student = 0 then
        signal sqlstate '45000' set message_text = '$Invalid student account ID$';
    end if;
    select ID into v_stud_id from student where account_ID = in_student_id limit 1;

    select count(*) into v_exists_sc from school_class where ID = in_sc_id;
    if v_exists_sc = 0 then
        signal sqlstate '45000' set message_text = '$Invalid school class ID$';
    end if;

    select count(*)
    into v_student_existent_to_class
    from class_student_association
    where student_ID = v_stud_id
      and school_class_ID = in_sc_id;

    if v_student_existent_to_class = 1 then
        update class_student_association
        set student_class_state=1
        where student_ID = v_stud_id
          and school_class_ID = in_sc_id;
    end if;

    insert into class_student_association (student_ID, school_class_ID, student_class_state)
    VALUES (v_stud_id, in_sc_id, 1);

    select last_insert_id() as ID;

end;

create or replace
    definer = root@localhost procedure SchoolClass_DenyStudent(IN in_student_id int, IN in_sc_id int)
begin
    declare v_exists_student integer default 0;
    declare v_exists_sc integer default 0;
    declare v_stud_id integer default 0;
    declare v_student_existent_to_class integer default 0;

    select count(*) into v_exists_student from student where account_ID = in_student_id;
    if v_exists_student = 0 then
        signal sqlstate '45000' set message_text = '$Invalid student account ID$';
    end if;
    select ID into v_stud_id from student where account_ID = in_student_id limit 1;

    select count(*) into v_exists_sc from school_class where ID = in_sc_id;
    if v_exists_sc = 0 then
        signal sqlstate '45000' set message_text = '$Invalid school class ID$';
    end if;

    select count(*)
    into v_student_existent_to_class
    from class_student_association
    where student_ID = v_stud_id
      and school_class_ID = in_sc_id;

    if v_student_existent_to_class = 1 then
        update class_student_association
        set student_class_state=2
        where student_ID = v_stud_id
          and school_class_ID = in_sc_id; #updates to DENIED

        select ID as ID from class_student_association where student_ID = v_stud_id and school_class_ID = in_sc_id;
    else
        insert into class_student_association (student_ID, school_class_ID, student_class_state)
        VALUES (v_stud_id, in_sc_id, 2); # DENY student

        select last_insert_id() as ID;
    end if;


end;



create or replace
    definer = root@localhost procedure Assignment_Add(IN in_acc_id int, IN in_school_class_id int,
                                                      IN in_task text)
    modifies sql data
begin
    declare v_teacher_ID integer;
    declare v_school_class_exists integer;
    declare v_school_class_is_of_given_teacher integer;

    set v_teacher_ID = -1;

    select ID into v_teacher_ID from teacher where account_ID = in_acc_id limit 1;

    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account id$';
    end if;

    set v_school_class_exists = 0;

    select count(*) into v_school_class_exists from school_class where school_class.ID = in_school_class_id;

    if v_school_class_exists = 0 then
        signal sqlstate '45000' set message_text = '$Invalid school class id$';
    end if;

    set v_school_class_is_of_given_teacher = 0;

    select count(*)
    into v_school_class_is_of_given_teacher
    from school_class
    where school_class.ID = in_school_class_id
      and school_class.subject_ID in (select ID from subject where subject.teacher_ID = v_teacher_ID);

    if v_school_class_is_of_given_teacher != 0 then
        signal sqlstate '45000' set message_text = '$School class does not belong to teacher$';
    end if;

    insert into assignment (school_class_ID, task) VALUES (in_school_class_id, in_task);

    select last_insert_id() as ID;
end;



create or replace
    definer = root@localhost procedure Grade_Add(IN in_teacher_acc_id int, IN in_student_acc_id int,
                                                 IN in_school_class_id int,
                                                 IN in_score_current int, IN in_score_ceiling int,
                                                 IN in_teacher_comment varchar(256))
    modifies sql data
begin
    declare v_student_ID integer;
    declare v_school_class_exists integer;
    declare v_teacher_ID integer default -1;
    declare v_class_belongs_to_teacher integer default -1;

    if in_score_current > in_score_ceiling then
        signal sqlstate '45000' set message_text = '$Student score should be lower or equal than score ceiling$';
    end if;

    select ID into v_teacher_ID from teacher where account_ID = in_teacher_acc_id;
    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account ID$';
    end if;

    select COUNT(*)
    into v_class_belongs_to_teacher
    from school_class
    where school_class.ID = in_school_class_id
      and subject_ID in (select ID from subject where subject.teacher_ID = v_teacher_ID);
    if v_class_belongs_to_teacher = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account ID$';
    end if;

    set v_student_ID = -1;

    select ID into v_student_ID from student where account_ID = in_student_acc_id limit 1;

    if v_student_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid student account id$';
    end if;

    set v_school_class_exists = 0;

    select count(*) into v_school_class_exists from school_class where school_class.ID = in_school_class_id;

    if v_school_class_exists = 0 then
        signal sqlstate '45000' set message_text = '$Invalid school class id$';
    end if;

    insert into grade (student_ID, school_class_ID, score_current, score_ceiling, teacher_comment)
    VALUES (v_student_ID, in_school_class_id, in_score_current, in_score_ceiling, in_teacher_comment);

    select last_insert_id() as ID;
end;

create or replace
    definer = root@localhost procedure Grade_AddForAssignment(IN in_teacher_acc_id int, IN in_assignment_id int,
                                                              IN in_student_acc_id int,
                                                              IN in_school_class_id int,
                                                              IN in_score_current int, IN in_score_ceiling int,
                                                              IN in_teacher_comment varchar(256))
    modifies sql data
begin
    declare v_student_ID integer;
    declare v_school_class_exists integer;
    declare v_exists_assignment integer;
    declare v_inserted_grade_ID integer;
    declare v_teacher_ID integer default -1;
    declare v_class_belongs_to_teacher integer default -1;

    select ID into v_teacher_ID from teacher where account_ID = in_teacher_acc_id;
    if v_teacher_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account ID$';
    end if;

    select COUNT(*)
    into v_class_belongs_to_teacher
    from school_class
    where school_class.ID = in_school_class_id
      and subject_ID in (select ID from subject where subject.teacher_ID = v_teacher_ID);
    if v_class_belongs_to_teacher = -1 then
        signal sqlstate '45000' set message_text = '$Invalid teacher account ID$';
    end if;
    set v_exists_assignment = 0;

    select count(*) into v_exists_assignment from assignment where ID = in_assignment_id;

    if v_exists_assignment = 0 then
        signal sqlstate '45000' set message_text = '$Nonexistent assignment id$';
    end if;

    if in_score_current > in_score_ceiling then
        signal sqlstate '45000' set message_text = '$Student score should be lower or equal than score ceiling$';
    end if;

    set v_student_ID = -1;

    select ID
    into v_student_ID
    from student
    where account_ID = in_student_acc_id
    limit 1;

    if v_student_ID = -1 then
        signal sqlstate '45000' set message_text = '$Invalid student account id$';
    end if;

    set v_school_class_exists = 0;

    select count(*)
    into v_school_class_exists
    from school_class
    where school_class.ID = in_school_class_id;

    if v_school_class_exists = 0 then
        signal sqlstate '45000' set message_text = '$Invalid school class id$';
    end if;

    insert into grade (student_ID, school_class_ID, score_current, score_ceiling, teacher_comment)
    VALUES (v_student_ID, in_school_class_id, in_score_current, in_score_ceiling, in_teacher_comment);

    select last_insert_id() into v_inserted_grade_ID;

    insert into assignment_grades (assignment_ID, grade_ID) VALUES (in_assignment_id, v_inserted_grade_ID);
end;



create or replace
    definer = root@localhost procedure Solution_ValidUpload(IN in_assignment_id int, IN in_student_acc_id int,
                                                            IN in_file_name varchar(256))
begin
    declare v_exists_assignment integer default 0;
    declare v_exists_student integer default 0;
    declare v_class_id integer;
    declare v_student_belongs_to_class integer default 0;
    declare v_stud_id integer default 0;
    declare v_solution_already_exists int default 0;

    select count(*) into v_exists_student from student where account_ID = in_student_acc_id;
    if v_exists_student = 0 then
        signal sqlstate '45000' set message_text = '$Invalid student account ID$';
    end if;
    select ID into v_stud_id from student where account_ID = in_student_acc_id limit 1;

    select count(*) into v_exists_assignment from assignment where assignment.ID = in_assignment_id;
    if v_exists_assignment = 0 then
        signal sqlstate '45000' set message_text = '$Invalid assignment ID$';
    end if;

    select school_class_ID into v_class_id from assignment where assignment.ID = in_assignment_id limit 1;

    select count(*)
    into v_student_belongs_to_class
    from class_student_association
    where student_class_state = 1
      and school_class_ID = v_class_id
      and class_student_association.student_ID = v_stud_id;

    if v_student_belongs_to_class = 0 then
        signal sqlstate '45000' set message_text = '$Student is not accepted in class$';
    end if;


    select count(*)
    into v_solution_already_exists
    from assignment_solution
    where assignment_ID = in_assignment_id
      and student_ID = v_stud_id;

    insert into assignment_solution (assignment_ID, file_name, student_ID)
    values (in_assignment_id, in_file_name, v_stud_id);

    select * from assignment_solution where ID = last_insert_id();
end;

