$(function() {
    $('table').dataTable({
        'bProcessing': true,
        'bServerSide': true,
        'sAjaxSource': '/report'
    });
});
